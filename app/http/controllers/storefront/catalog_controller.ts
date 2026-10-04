import { productStructuredData } from '#core/support/seo'
import { productReviews } from '#modules/reviews/queries/product_reviews'
import Wishlist from '#modules/wishlist/models/wishlist'
import type { HttpContext } from '@adonisjs/core/http'
import Category from '#domains/catalog/models/category'
import SearchCatalog from '#domains/catalog/queries/search_catalog'
import { catalogQueryValidator } from '#domains/catalog/validators/catalog'
import { productDetail, productSummary } from '#domains/catalog/data/product_data'
import { loadPublishedProduct } from '#domains/catalog/queries/load_product'
import { validationMessages } from '#core/support/validation_messages'

export default class CatalogController {
  async index(ctx: HttpContext) {
    const filters = await ctx.request.validateUsing(catalogQueryValidator, {
      messagesProvider: validationMessages(ctx.locale),
    })
    const result = await new SearchCatalog().query(filters).paginate(filters.page ?? 1, 12)
    const categories = await Category.query().where('isActive', true).orderBy('name')
    return ctx.inertia.render('storefront/catalog', {
      products: result.all().map(productSummary),
      categories: categories.map((row) => ({
        name: row.name,
        slug: row.slug,
      })),
      filters: {
        q: filters.q ?? '',
        category: filters.category ?? '',
        inStock: filters.inStock ?? '',
      },
      pagination: { page: result.currentPage, lastPage: result.lastPage, total: result.total },
    })
  }

  async show(ctx: HttpContext) {
    const product = await loadPublishedProduct(ctx.params.slug)
    return ctx.inertia.render('storefront/product', {
      product: productDetail(product),
      structuredData: productStructuredData(productDetail(product), ctx.store.name),
      reviews: ctx.capabilities.reviews.available
        ? await productReviews(product.id, ctx.auth.user?.id)
        : null,
      saved:
        ctx.auth.user && ctx.capabilities.wishlist.available
          ? !!(await Wishlist.query()
              .where('customerId', ctx.auth.user.id)
              .where('productId', product.id)
              .first())
          : false,
    })
  }
}
