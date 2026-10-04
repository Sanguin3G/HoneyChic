import type { HttpContext } from '@adonisjs/core/http'
import Category from '#domains/catalog/models/category'
import SearchCatalog from '#domains/catalog/queries/search_catalog'
import { productSummary } from '#domains/catalog/data/product_data'
export default class HomeController {
  async show({ inertia }: HttpContext) {
    const products = await new SearchCatalog().query({}).limit(4)
    const categories = await Category.query().where('isActive', true).orderBy('name').limit(8)
    return inertia.render('storefront/home', {
      products: products.map(productSummary),
      categories: categories.map((category) => ({ name: category.name, slug: category.slug })),
    })
  }
}
