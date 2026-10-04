import db from '@adonisjs/lucid/services/db'
import User from '#domains/customers/models/user'
import Wishlist from '#modules/wishlist/models/wishlist'
import { loadPublishedProduct } from '#domains/catalog/queries/load_product'
import { requireCapability, rejectModule } from '#modules/support/require_capability'
import type { Locale } from '#core/support/locale'
export default class SaveWishlist {
  async execute(customerId: number, slug: string, save: boolean, locale: Locale) {
    return db.transaction(async (trx) => {
      await requireCapability('wishlist', locale, trx)
      await requireCapability('customer_accounts', locale, trx)
      await User.query({ client: trx }).where('id', customerId).forUpdate().firstOrFail()
      const product = await loadPublishedProduct(slug)
      const existing = await Wishlist.query({ client: trx })
        .where('customerId', customerId)
        .where('productId', product.id)
        .first()
      if (!save) {
        if (existing) await existing.delete()
        return
      }
      if (existing) return existing
      const count = await Wishlist.query({ client: trx })
        .where('customerId', customerId)
        .count('* as total')
      if (Number(count[0].$extras.total) >= 100) rejectModule('wishlistLimit', locale)
      return Wishlist.create({ customerId, productId: product.id }, { client: trx })
    })
  }
}
