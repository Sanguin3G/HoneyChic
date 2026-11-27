import db from '@adonisjs/lucid/services/db'
import Order from '#domains/orders/models/order'
import OrderItem from '#domains/orders/models/order_item'
import OrderReturn from '#domains/orders/models/order_return'
import AdjustInventory from '#domains/inventory/adjust_inventory'
import { rejectOrder } from '#domains/orders/reject_order'
import type { Locale } from '#core/support/locale'

export default class RecordReturn {
  async execute(
    publicId: string,
    input: { orderItemId: number; quantity: number; reference: string; note?: string | null },
    actor: { id: number | null; admin: boolean },
    locale: Locale
  ) {
    if (!actor.admin || !actor.id) rejectOrder('forbidden', locale)
    const reference = input.reference.trim()
    if (
      !reference ||
      reference.length > 100 ||
      !Number.isInteger(input.quantity) ||
      input.quantity < 1
    ) {
      rejectOrder('invalidReturn', locale)
    }
    return db.transaction(async (trx) => {
      const order = await Order.query({ client: trx })
        .where('publicId', publicId)
        .forUpdate()
        .firstOrFail()
      const existing = await OrderReturn.query({ client: trx })
        .where('orderId', order.id)
        .where('reference', reference)
        .first()
      if (existing) return existing
      if (order.status === 'cancelled') {
        rejectOrder('cannotReturn', locale)
      }
      const item = await OrderItem.query({ client: trx })
        .where('orderId', order.id)
        .where('id', input.orderItemId)
        .first()
      if (!item || !item.productVariantId) {
        rejectOrder('cannotReturn', locale)
      }
      const returns = await OrderReturn.query({ client: trx }).where('orderItemId', item.id)
      const returnedQuantity = returns.reduce((sum, row) => sum + row.quantity, 0)
      if (input.quantity > item.quantity - returnedQuantity) {
        rejectOrder('invalidReturn', locale)
      }
      await new AdjustInventory().execute(
        {
          variantId: item.productVariantId,
          quantityDelta: input.quantity,
          reason: 'return',
          reference: `${order.number}:${reference}`,
          note: input.note?.trim() ?? '',
          actorId: actor.id,
        },
        locale,
        trx
      )
      return OrderReturn.create(
        {
          orderId: order.id,
          orderItemId: item.id,
          actorId: actor.id,
          quantity: input.quantity,
          reference,
          note: input.note?.trim() ?? '',
        },
        { client: trx }
      )
    })
  }
}
