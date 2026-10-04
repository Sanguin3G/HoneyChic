import SearchCatalog from '#domains/catalog/queries/search_catalog'
import Product from '#domains/catalog/models/product'

export function loadProduct(id: number) {
  return Product.query()
    .where('id', id)
    .preload('category')
    .preload('variants', (query) =>
      query.where('isActive', true).orderBy('id').preload('optionValues')
    )
    .preload('options', (query) =>
      query.orderBy('sortOrder').preload('values', (values) => values.orderBy('sortOrder'))
    )
    .preload('images', (query) => query.orderBy('sortOrder'))
    .firstOrFail()
}

export function loadPublishedProduct(slug: string) {
  return new SearchCatalog()
    .query({})
    .where('slug', slug)
    .preload('options', (query) =>
      query.orderBy('sortOrder').preload('values', (values) => values.orderBy('sortOrder'))
    )
    .preload('images', (query) => query.orderBy('sortOrder'))
    .firstOrFail()
}
