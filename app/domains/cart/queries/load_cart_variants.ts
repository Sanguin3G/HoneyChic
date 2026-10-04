import ProductVariant from '#domains/catalog/models/product_variant'

export function loadCartVariants(ids: number[]) {
  return ProductVariant.query()
    .whereIn('id', ids)
    .preload('product', (product) => {
      product.preload('category').preload('images', (images) => images.where('isPrimary', true))
    })
}
export function isPublicVariant(variant: ProductVariant | undefined) {
  return (
    !!variant?.isActive &&
    variant.product?.status === 'published' &&
    (!variant.product.categoryId || variant.product.category?.isActive === true)
  )
}
