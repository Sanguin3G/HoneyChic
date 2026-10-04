import type { CheckoutParticipation } from '#domains/orders/data/checkout_charges'
import { randomUUID } from 'node:crypto'
import db from '@adonisjs/lucid/services/db'
import StoreSetting from '#core/store/store_setting'
import Product from '#domains/catalog/models/product'
import ProductVariant from '#domains/catalog/models/product_variant'
import Category from '#domains/catalog/models/category'
import Order from '#domains/orders/models/order'
import OrderItem from '#domains/orders/models/order_item'
import AdjustInventory from '#domains/inventory/actions/adjust_inventory'
import { readCartState, type CartState } from '#domains/cart/data/cart_state'
import { rejectOrder } from '#domains/orders/errors/reject_order'
import type { Locale } from '#core/support/locale'
import type { Infer } from '@vinejs/vine/types'
import type { checkoutValidator } from '#domains/orders/validators/orders'

export function orderWasJustPlaced(order: Order) {
  return order.$extras.justPlaced === true
}

export default class PlaceOrder {
  async execute(
    state: CartState,
    input: Infer<typeof checkoutValidator>,
    customerId: number | null,
    locale: Locale,
    reviewedState: CartState = state,
    participation?: CheckoutParticipation
  ) {
    return db.transaction(async (trx) => {
      // Serializes retries even before the order exists. The unique key is the final safeguard.
      await trx.rawQuery('SELECT pg_advisory_xact_lock(hashtextextended(?, 0))', [input.token])
      const existing = await Order.query({ client: trx }).where('checkoutKey', input.token).first()
      if (existing) {
        if (existing.customerId !== customerId) rejectOrder('invalidCheckout', locale)
        return existing
      }
      const store = await StoreSetting.query({ client: trx })
        .where('id', 1)
        .forShare()
        .firstOrFail()
      if (
        (!customerId && !store.guestCheckoutEnabled) ||
        (customerId && !store.customerAccountsEnabled)
      ) {
        rejectOrder('checkoutDisabled', locale)
      }
      const cart = readCartState(state)
      if (!cart.lines.length) rejectOrder('emptyCart', locale)
      const review = readCartState(reviewedState)
      const reviewed = new Map(
        review.lines.map(([id, quantity, price]) => [id, { quantity, price }])
      )
      if (review.currency !== cart.currency || review.lines.length !== cart.lines.length)
        rejectOrder('invalidCheckout', locale)
      const ids = cart.lines.map((line) => line[0]).sort((a, b) => a - b)
      const initial = await ProductVariant.query({ client: trx }).whereIn('id', ids)
      // Catalog writers lock product before variants. Checkout follows the same order.
      const productIds = [...new Set(initial.map((variant) => variant.productId))].sort(
        (a, b) => a - b
      )
      const products = await Product.query({ client: trx })
        .whereIn('id', productIds)
        .orderBy('id')
        .forUpdate()
      const categoryIds = [
        ...new Set(
          products.map((product) => product.categoryId).filter((id): id is number => id !== null)
        ),
      ]
      const categories = await Category.query({ client: trx })
        .whereIn('id', categoryIds)
        .orderBy('id')
        .forShare()
      const variants = await ProductVariant.query({ client: trx })
        .whereIn('id', ids)
        .orderBy('id')
        .forUpdate()
      const byId = new Map(variants.map((variant) => [variant.id, variant]))
      const byProduct = new Map(products.map((product) => [product.id, product]))
      const byCategory = new Map(categories.map((category) => [category.id, category]))
      let total = 0n
      for (const [id, quantity] of cart.lines) {
        const variant = byId.get(id)
        const product = variant && byProduct.get(variant.productId)
        if (
          !variant?.isActive ||
          !product ||
          product.status !== 'published' ||
          (product.categoryId && !byCategory.get(product.categoryId)?.isActive) ||
          variant.currency !== cart.currency
        )
          rejectOrder('unavailable', locale)
        if (variant.stock < quantity) rejectOrder('insufficientStock', locale)
        const observed = reviewed.get(id)
        if (!observed || observed.quantity !== quantity || observed.price !== variant.priceMinor)
          rejectOrder('priceChanged', locale)
        total += BigInt(variant.priceMinor) * BigInt(quantity)
      }
      if (total > BigInt(Number.MAX_SAFE_INTEGER)) rejectOrder('amountLimit', locale)
      const charges = participation
        ? await participation.quote(Number(total), cart.currency!, trx)
        : { discountMinor: 0, shippingMinor: 0, shippingName: '', couponCode: '' }
      if (
        !Number.isSafeInteger(charges.discountMinor) ||
        !Number.isSafeInteger(charges.shippingMinor) ||
        charges.discountMinor < 0 ||
        charges.discountMinor > Number(total) ||
        charges.shippingMinor < 0
      )
        rejectOrder('amountLimit', locale)
      total = total - BigInt(charges.discountMinor) + BigInt(charges.shippingMinor)
      if (total > BigInt(Number.MAX_SAFE_INTEGER)) rejectOrder('amountLimit', locale)
      // Never use the submitted total to calculate money. It only detects a stale review.
      if (Number(total) !== input.expectedTotalMinor) rejectOrder('priceChanged', locale)
      const publicId = randomUUID()
      const order = await Order.create(
        {
          publicId,
          checkoutKey: input.token,
          number: publicId,
          customerId,
          status: 'pending',
          paymentStatus: 'unpaid',
          currency: cart.currency!,
          totalMinor: Number(total),
          ...charges,
          customerName: input.customerName,
          customerEmail: input.customerEmail,
          customerPhone: input.customerPhone,
          deliveryAddress: input.deliveryAddress,
          note: input.note ?? '',
          locale,
        },
        { client: trx }
      )
      await order
        .merge({ number: store.orderPrefix + '-' + String(order.id).padStart(6, '0') })
        .save()
      const quantities = new Map(cart.lines.map(([id, quantity]) => [id, quantity]))
      for (const variant of variants) {
        const quantity = quantities.get(variant.id)!
        await OrderItem.create(
          {
            orderId: order.id,
            productId: variant.productId,
            productVariantId: variant.id,
            productName: byProduct.get(variant.productId)!.name,
            variantDescription: variant.description,
            sku: variant.sku,
            unitPriceMinor: variant.priceMinor,
            quantity,
            discountMinor: 0,
            taxMinor: 0,
          },
          { client: trx }
        )
        await new AdjustInventory().execute(
          {
            variantId: variant.id,
            quantityDelta: -quantity,
            reason: 'sale',
            reference: order.number,
            actorId: customerId,
          },
          locale,
          trx
        )
      }
      if (participation) await participation.created(order, trx)
      order.$extras.justPlaced = true
      return order
    })
  }
}
