import db from '@adonisjs/lucid/services/db'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'
import ProductVariant from '#domains/catalog/models/product_variant'
import InventoryMovement from '#domains/inventory/models/inventory_movement'
import {
  movementReasons,
  maximumStock,
  type MovementReason,
} from '#domains/inventory/data/movement_reasons'
import { rejectInventory } from '#domains/inventory/errors/reject_inventory'
import type { Locale } from '#core/support/locale'

export interface InventoryAdjustment {
  variantId: number
  quantityDelta: number
  reason: MovementReason
  reference?: string | null
  note?: string | null
  actorId: number | null
}

/** Lock, change stock and append its movement together. A caller may supply its transaction. */
export default class AdjustInventory {
  async execute(
    input: InventoryAdjustment,
    locale: Locale,
    transaction?: TransactionClientContract
  ) {
    if (
      !Number.isInteger(input.quantityDelta) ||
      input.quantityDelta === 0 ||
      Math.abs(input.quantityDelta) > maximumStock
    ) {
      rejectInventory('quantityDelta', 'invalidDelta', locale)
    }
    if (!movementReasons.includes(input.reason)) rejectInventory('reason', 'invalidReason', locale)
    const positive = ['initial_stock', 'restock', 'return', 'cancellation'].includes(input.reason)
    if (
      (positive && input.quantityDelta < 0) ||
      (input.reason === 'sale' && input.quantityDelta > 0)
    ) {
      rejectInventory('quantityDelta', 'invalidDirection', locale)
    }
    const apply = async (trx: TransactionClientContract) => {
      const variant = await ProductVariant.query({ client: trx })
        .where('id', input.variantId)
        .forUpdate()
        .firstOrFail()
      const retiredCorrection = input.reason === 'correction' && input.quantityDelta < 0
      if (!variant.isActive && input.reason !== 'cancellation' && !retiredCorrection)
        rejectInventory('quantityDelta', 'retiredError', locale)
      if (
        input.reason === 'initial_stock' &&
        (await InventoryMovement.query({ client: trx })
          .where('productVariantId', variant.id)
          .first())
      ) {
        rejectInventory('reason', 'alreadyInitialized', locale)
      }
      const stockAfter = variant.stock + input.quantityDelta
      if (stockAfter < 0) rejectInventory('quantityDelta', 'insufficientStock', locale)
      if (stockAfter > maximumStock) rejectInventory('quantityDelta', 'stockOverflow', locale)
      await variant.merge({ stock: stockAfter }).save()
      return InventoryMovement.create(
        {
          productVariantId: variant.id,
          quantityDelta: input.quantityDelta,
          stockAfter,
          reason: input.reason,
          reference: input.reference ?? null,
          note: input.note ?? '',
          actorId: input.actorId,
        },
        { client: trx }
      )
    }
    return transaction ? apply(transaction) : db.transaction(apply)
  }
}
