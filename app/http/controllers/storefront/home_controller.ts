import type { HttpContext } from '@adonisjs/core/http'
import Category from '#domains/catalog/models/category'
import SearchCatalog from '#domains/catalog/queries/search_catalog'
import { publishedProducts } from '#domains/catalog/queries/published_products'
import { productSummary } from '#domains/catalog/product_data'
import { mediaUrl } from '#core/support/stored_media'

export default class HomeController {
  async show({ inertia }: HttpContext) {
    const products = await new SearchCatalog().query({}).limit(8)
    const categories = await Category.query().where('isActive', true).orderBy('name').limit(8)
    // Each category shows the primary photo of one of its published products, if any.
    const covers = await Promise.all(
      categories.map((category) =>
        publishedProducts()
          .where('categoryId', category.id)
          .preload('images', (images) => images.orderBy('isPrimary', 'desc').orderBy('sortOrder'))
          .orderBy('id')
          .first()
      )
    )
    return inertia.render('storefront/home', {
      products: products.map(productSummary),
      categories: categories.map((category, index) => {
        const image = covers[index]?.images[0]
        return {
          name: category.name,
          slug: category.slug,
          image: image ? { url: mediaUrl(image.storageKey), altText: image.altText } : null,
        }
      }),
    })
  }
}
