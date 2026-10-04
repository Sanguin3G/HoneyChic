import Product from '#domains/catalog/models/product'
/** Shared public visibility for catalog, wishlist and sitemap. No relationships are loaded here. */
export function publishedProducts() {
  return Product.query()
    .where('status', 'published')
    .whereHas('variants', (variants) => variants.where('isActive', true))
    .where((categories) =>
      categories
        .whereNull('categoryId')
        .orWhereHas('category', (category) => category.where('isActive', true))
    )
}
