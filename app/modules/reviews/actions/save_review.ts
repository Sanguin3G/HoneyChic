import db from '@adonisjs/lucid/services/db'
import User from '#domains/customers/models/user'
import OrderItem from '#domains/orders/models/order_item'
import Review from '#modules/reviews/models/review'
import { loadPublishedProduct } from '#domains/catalog/queries/load_product'
import { requireCapability, rejectModule } from '#modules/support/require_capability'
import type { Locale } from '#core/support/locale'
export default class SaveReview {
  async execute(
    customerId: number,
    slug: string,
    input: { rating: number; body: string },
    locale: Locale
  ) {
    return db.transaction(async (trx) => {
      await requireCapability('reviews', locale, trx)
      await requireCapability('customer_accounts', locale, trx)
      await User.query({ client: trx }).where('id', customerId).forUpdate().firstOrFail()
      const product = await loadPublishedProduct(slug)
      const purchase = await OrderItem.query({ client: trx })
        .where('productId', product.id)
        .whereIn(
          'orderId',
          trx
            .from('orders')
            .select('id')
            .where('customer_id', customerId)
            .where('status', 'completed')
        )
        .first()
      if (!purchase) rejectModule('purchaseRequired', locale)
      const existing = await Review.query({ client: trx })
        .where('customerId', customerId)
        .where('productId', product.id)
        .first()
      // One editable review per customer/product, irrespective of repeat purchases.
      if (existing) return existing.merge(input).save()
      return Review.create({ customerId, productId: product.id, ...input }, { client: trx })
    })
  }
}
