import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import CreateProduct from '#domains/catalog/actions/create_product'
import Category from '#domains/catalog/models/category'
import ProductVariant from '#domains/catalog/models/product_variant'
import AdjustInventory from '#domains/inventory/actions/adjust_inventory'

function pageData(html: string) {
  const data = html.match(/<script[^>]*data-page="[^"]*"[^>]*>([\s\S]*?)<\/script>/)?.[1]
  if (!data) throw new Error('Missing Inertia page data')
  return JSON.parse(data)
}
test.group('Storefront publication and filters', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())
  test('home and in-stock search respect publication, category visibility and current availability', async ({
    client,
    assert,
  }) => {
    const hidden = await Category.create({
      name: 'Hidden category',
      slug: 'hidden',
      description: '',
      isActive: false,
    })
    for (const [slug, status, categoryId, stock] of [
      ['available-item', 'published', null, 2],
      ['out-item', 'published', null, 0],
      ['draft-item', 'draft', null, 2],
      ['hidden-item', 'published', hidden.id, 2],
    ] as const) {
      const product = await new CreateProduct().execute(
        {
          name: slug,
          slug,
          description: '',
          categoryId,
          status,
          options: [],
          images: [],
          variants: [{ sku: slug.toUpperCase(), price: '1', selections: [] }],
        },
        'USD',
        'en'
      )
      if (stock) {
        const variant = await ProductVariant.findByOrFail('productId', product.id)
        await new AdjustInventory().execute(
          { variantId: variant.id, quantityDelta: stock, reason: 'initial_stock', actorId: null },
          'en'
        )
      }
    }
    const home = await client.get('/').header('Accept', 'text/html')
    home.assertStatus(200)
    assert.deepEqual(
      pageData(home.text()).props.products.map((product: { slug: string }) => product.slug),
      ['available-item', 'out-item']
    )
    const listing = await client.get('/products?inStock=1').header('Accept', 'text/html')
    listing.assertStatus(200)
    const page = pageData(listing.text())
    assert.lengthOf(page.props.products, 1)
    assert.equal(page.props.products[0].slug, 'available-item')
    assert.equal(page.props.filters.inStock, '1')
    assert.equal(page.props.pagination.total, 1)
  })
})
