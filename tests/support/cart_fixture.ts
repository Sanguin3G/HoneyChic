import CreateProduct from '#domains/catalog/actions/create_product'
import UpdateProduct from '#domains/catalog/actions/update_product'
import Category from '#domains/catalog/models/category'
import { loadProduct } from '#domains/catalog/queries/load_product'
import { productEditor } from '#domains/catalog/data/product_data'
import AdjustInventory from '#domains/inventory/actions/adjust_inventory'
export async function cartFixture(
  slug = 'cart-keyboard',
  currency = 'USD',
  price = '10',
  stock = 5
) {
  const category = await Category.create({ name: slug, slug, description: '', isActive: true })
  const product = await new CreateProduct().execute(
    {
      name: slug,
      slug,
      description: '',
      categoryId: category.id,
      status: 'published',
      options: [{ name: 'Switch', values: ['Linear', 'Tactile'] }],
      images: [{ storageKey: 'catalog/keyboard.svg', altText: 'Keyboard', isPrimary: true }],
      variants: [
        { sku: slug.toUpperCase() + '-L', price, selections: ['Linear'] },
        { sku: slug.toUpperCase() + '-T', price, selections: ['Tactile'] },
      ],
    },
    currency,
    'en'
  )
  const loaded = await loadProduct(product.id)
  if (stock)
    for (const variant of loaded.variants)
      await new AdjustInventory().execute(
        {
          variantId: variant.id,
          quantityDelta: stock,
          reason: 'initial_stock',
          actorId: null,
        },
        'en'
      )
  return { product: loaded, category, variants: loaded.variants }
}
export async function repriceCartProduct(id: number, price: string) {
  const input = productEditor(await loadProduct(id))
  input.variants.forEach((variant) => {
    variant.price = price
  })
  await new UpdateProduct().execute(id, input, 'en')
}
export function inertiaPage(html: string) {
  const data = html.match(/<script[^>]*data-page="[^"]*"[^>]*>([\s\S]*?)<\/script>/)?.[1]
  if (!data) throw new Error('Missing Inertia page data')
  return JSON.parse(data)
}
