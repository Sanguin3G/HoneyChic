import { publishedProducts } from './published_products.js'
import Product from '#domains/catalog/models/product'

export default class SearchCatalog {
  query(input: { q?: string; category?: string; inStock?: string }, admin = false) {
    const query = admin ? Product.query() : publishedProducts()
    if (input.inStock === '1')
      query.whereHas('variants', (variants) =>
        variants.where('isActive', true).where('stock', '>', 0)
      )
    if (input.category)
      query.whereHas('category', (category) => category.where('slug', input.category!))
    if (input.q) {
      const literal = '%' + input.q.replace(/[\\%_]/g, '\\$&') + '%'
      query.where((search) =>
        search
          .whereRaw("search_document @@ websearch_to_tsquery('simple', ?)", [input.q!])
          .orWhereILike('name', literal)
          .orWhereHas('variants', (variants) =>
            variants.where('isActive', true).whereILike('sku', literal)
          )
      )
    }
    return query
      .preload('category')
      .preload('variants', (variants) =>
        variants.where('isActive', true).orderBy('priceMinor').orderBy('id')
      )
      .preload('images', (images) => images.where('isPrimary', true))
      .orderBy('name')
      .orderBy('id')
  }
}
