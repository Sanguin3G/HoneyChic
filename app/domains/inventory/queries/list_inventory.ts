import ProductVariant from '#domains/catalog/models/product_variant'
export function listInventory(input: { q?: string; state?: string }, threshold: number) {
  const query = ProductVariant.query().preload('product')
  if (input.state === 'retired') query.where('isActive', false)
  else query.where('isActive', true)
  if (input.state === 'low') query.where('stock', '>', 0).where('stock', '<=', threshold)
  if (input.state === 'out') query.where('stock', '<=', 0)
  if (input.q) {
    const literal = '%' + input.q.replace(/[\\%_]/g, '\\$&') + '%'
    query.where((search) =>
      search
        .whereILike('sku', literal)
        .orWhereHas('product', (product) => product.whereILike('name', literal))
    )
  }
  return query.orderBy('sku').orderBy('id')
}
