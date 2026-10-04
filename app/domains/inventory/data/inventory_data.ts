import type ProductVariant from '#domains/catalog/models/product_variant'
export function inventoryData(variant: ProductVariant, threshold: number) {
  return {
    id: variant.id,
    sku: variant.sku,
    description: variant.description,
    stock: variant.stock,
    isActive: variant.isActive,
    product: { id: variant.product.id, name: variant.product.name },
    state: !variant.isActive
      ? 'retired'
      : variant.stock === 0
        ? 'out'
        : variant.stock <= threshold
          ? 'low'
          : 'available',
  }
}
