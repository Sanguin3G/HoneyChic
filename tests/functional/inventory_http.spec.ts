import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import User from '#domains/customers/models/user'
import CreateProduct from '#domains/catalog/actions/create_product'
import { loadProduct } from '#domains/catalog/queries/load_product'
import ProductVariant from '#domains/catalog/models/product_variant'
import InventoryMovement from '#domains/inventory/models/inventory_movement'

function pageData(html: string) {
  const data = html.match(/<script[^>]*data-page="[^"]*"[^>]*>([\s\S]*?)<\/script>/)?.[1]
  if (!data) throw new Error('Missing Inertia page data')
  return JSON.parse(data)
}
async function fixture() {
  const product = await new CreateProduct().execute(
    {
      name: 'Notebook',
      slug: 'inventory-notebook',
      description: '',
      categoryId: null,
      status: 'published',
      options: [],
      images: [],
      variants: [{ sku: 'STOCK-BOOK', price: '1', selections: [] }],
    },
    'VND',
    'en'
  )
  const loaded = await loadProduct(product.id)
  return loaded.variants[0]
}
async function actor(role: 'staff' | 'customer') {
  return User.create({
    fullName: role,
    email: role + '@inventory.test',
    password: 'test-password-123456',
    role,
  })
}
test.group('Inventory HTTP boundaries', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('staff adjusts stock with the authenticated actor and bilingual movement history', async ({
    client,
    assert,
  }) => {
    const variant = await fixture()
    const staff = await actor('staff')
    const response = await client
      .post('/admin/inventory/' + variant.id + '/adjust')
      .loginAs(staff)
      .withCsrfToken()
      .redirects(0)
      .json({
        quantityDelta: 3,
        reason: 'initial_stock',
        reference: 'Count 01',
        note: 'Merchant note',
        actorId: null,
        stock: 999,
      })
    response.assertStatus(302)
    const movement = await InventoryMovement.findByOrFail('productVariantId', variant.id)
    assert.equal(movement.actorId, staff.id)
    assert.equal(movement.stockAfter, 3)
    for (const locale of ['en', 'vi']) {
      const history = await client
        .get('/admin/inventory/' + variant.id)
        .loginAs(staff)
        .header('Accept', 'text/html')
        .header('Accept-Language', locale)
      history.assertStatus(200)
      const page = pageData(history.text())
      assert.equal(page.component, 'admin/inventory/show')
      assert.equal(page.props.locale, locale)
      assert.equal(page.props.variant.state, 'low')
      assert.equal(page.props.movements[0].actor, staff.fullName)
      assert.include(history.text(), 'Merchant note')
      const listing = await client
        .get('/admin/inventory?state=low')
        .loginAs(staff)
        .header('Accept', 'text/html')
      listing.assertStatus(200)
      assert.lengthOf(pageData(listing.text()).props.variants, 1)
    }
    const publicPage = await client
      .get('/products/inventory-notebook')
      .header('Accept', 'text/html')
    publicPage.assertStatus(200)
    const product = pageData(publicPage.text()).props.product
    assert.isTrue(product.variants[0].available)
    assert.notProperty(product.variants[0], 'stock')
  })

  test('customers cannot read or alter inventory and manual endpoints reject sale reasons', async ({
    client,
    assert,
  }) => {
    const variant = await fixture()
    const customer = await actor('customer')
    for (const url of ['/admin/inventory', '/admin/inventory/' + variant.id]) {
      const read = await client.get(url).loginAs(customer).header('Accept', 'application/json')
      read.assertStatus(403)
    }
    const denied = await client
      .post('/admin/inventory/' + variant.id + '/adjust')
      .loginAs(customer)
      .withCsrfToken()
      .header('Accept', 'application/json')
      .json({ quantityDelta: 2, reason: 'restock', reference: null, note: '' })
    denied.assertStatus(403)
    const staff = await actor('staff')
    const sale = await client
      .post('/admin/inventory/' + variant.id + '/adjust')
      .loginAs(staff)
      .withCsrfToken()
      .header('Accept', 'application/json')
      .json({ quantityDelta: -1, reason: 'sale', reference: null, note: '' })
    sale.assertStatus(422)
    const unchanged = await ProductVariant.findOrFail(variant.id)
    assert.equal(unchanged.stock, 0)
    assert.lengthOf(await InventoryMovement.query().where('productVariantId', variant.id), 0)
  })

  test('negative stock errors are localized and leave no movement', async ({ client, assert }) => {
    const variant = await fixture()
    const staff = await actor('staff')
    const response = await client
      .post('/admin/inventory/' + variant.id + '/adjust')
      .loginAs(staff)
      .withCsrfToken()
      .header('Accept', 'application/json')
      .header('Accept-Language', 'vi')
      .json({ quantityDelta: -1, reason: 'manual_adjustment', reference: null, note: '' })
    response.assertStatus(422)
    assert.include(response.text(), 'Điều chỉnh này sẽ làm tồn kho âm.')
    assert.lengthOf(await InventoryMovement.query().where('productVariantId', variant.id), 0)
  })
})
