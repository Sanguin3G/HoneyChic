import { validationMessages } from '#core/support/validation_messages'
import type { HttpContext } from '@adonisjs/core/http'
import vine from '@vinejs/vine'
import Wishlist from '#modules/wishlist/models/wishlist'
import SaveWishlist from '#modules/wishlist/actions/save_wishlist'
import SearchCatalog from '#domains/catalog/queries/search_catalog'
import { productSummary } from '#domains/catalog/data/product_data'
import { requireCapability } from '#modules/support/require_capability'
const validator = vine.create({
  slug: vine.string().trim().minLength(1).maxLength(200),
  save: vine.boolean(),
})
export default class WishlistController {
  async index(ctx: HttpContext) {
    await requireCapability('wishlist', ctx.locale)
    const favorites = await Wishlist.query().where('customerId', ctx.auth.getUserOrFail().id)
    const products = await new SearchCatalog()
      .query({})
      .whereIn(
        'id',
        Wishlist.query().select('productId').where('customerId', ctx.auth.getUserOrFail().id)
      )
      .limit(100)
    const visible = new Set(products.map((product) => product.id))
    return ctx.inertia.render('account/wishlist', {
      products: products.map(productSummary),
      unavailableIds: favorites.filter((row) => !visible.has(row.productId)).map((row) => row.id),
    })
  }
  async update(ctx: HttpContext) {
    const input = await ctx.request.validateUsing(validator, {
      messagesProvider: validationMessages(ctx.locale),
    })
    await new SaveWishlist().execute(
      ctx.auth.getUserOrFail().id,
      input.slug,
      input.save,
      ctx.locale
    )
    return ctx.response.redirect().toPath('/products/' + encodeURIComponent(input.slug))
  }
  async destroy(ctx: HttpContext) {
    await requireCapability('wishlist', ctx.locale)
    const { id } = await vine
      .create({ id: vine.number().withoutDecimals().positive().max(2147483647) })
      .validate(ctx.params, { messagesProvider: validationMessages(ctx.locale) })
    await Wishlist.query().where('customerId', ctx.auth.getUserOrFail().id).where('id', id).delete()
    return ctx.response.redirect().toPath('/account/wishlist')
  }
}
