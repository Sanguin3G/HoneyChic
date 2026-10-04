import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import User from '#domains/customers/models/user'
import Product from '#domains/catalog/models/product'
import Category from '#domains/catalog/models/category'
import CreateProduct from '#domains/catalog/actions/create_product'
import { loadProduct } from '#domains/catalog/queries/load_product'

const input = {
  name: 'Notebook',
  slug: 'notebook',
  description: '',
  categoryId: null,
  status: 'published' as const,
  options: [],
  variants: [{ sku: 'BOOK-1', price: '125000', selections: [] }],
  images: [],
}

function pageData(html: string) {
  const data = html.match(/<script[^>]*data-page="[^"]*"[^>]*>([\s\S]*?)<\/script>/)?.[1]
  if (!data) throw new Error('Missing Inertia page data')
  return JSON.parse(data)
}
async function actor(role: 'staff' | 'customer') {
  return User.create({
    fullName: role,
    email: role + '@catalog.test',
    password: 'test-password-123456',
    role,
  })
}

test.group('Catalog HTTP boundaries', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('staff can edit catalog; customers cannot enter or mutate catalog admin', async ({
    client,
    assert,
  }) => {
    const staff = await actor('staff')
    const response = await client
      .post('/admin/products')
      .loginAs(staff)
      .withCsrfToken()
      .redirects(0)
      .json(input)
    response.assertStatus(302)
    const product = await Product.findByOrFail('slug', 'notebook')
    const loaded = await loadProduct(product.id)
    assert.equal(loaded.variants[0].priceMinor, 125000)
    response.assertHeader('location', '/admin/products/' + product.id + '/edit')
    const edit = await client
      .get('/admin/products/' + product.id + '/edit')
      .loginAs(staff)
      .header('Accept', 'text/html')
    edit.assertStatus(200)
    assert.equal(pageData(edit.text()).component, 'admin/catalog/edit_product')
    const customer = await actor('customer')
    for (const url of ['/admin/products', '/admin/products/create', '/admin/categories']) {
      const forbidden = await client.get(url).loginAs(customer).header('Accept', 'application/json')
      forbidden.assertStatus(403)
    }
    const denied = await client
      .put('/admin/products/' + product.id)
      .loginAs(customer)
      .withCsrfToken()
      .header('Accept', 'application/json')
      .json({ ...input, name: 'Forbidden' })
    denied.assertStatus(403)
    const unchanged = await Product.findOrFail(product.id)
    assert.equal(unchanged.name, input.name)
  })

  test('category changes and SKU conflicts validate in Vietnamese', async ({ client, assert }) => {
    const staff = await actor('staff')
    const category = await client
      .post('/admin/categories')
      .loginAs(staff)
      .withCsrfToken()
      .redirects(0)
      .json({ name: 'Stationery', slug: 'stationery', description: '', isActive: true })
    category.assertStatus(302)
    assert.exists(await Category.findBy('slug', 'stationery'))
    await new CreateProduct().execute(input, 'VND', 'en')
    const duplicate = await client
      .post('/admin/products')
      .loginAs(staff)
      .withCsrfToken()
      .header('Accept', 'application/json')
      .header('Accept-Language', 'vi')
      .json({ ...input, slug: 'conflict' })
    duplicate.assertStatus(422)
    assert.include(duplicate.text(), 'Đường dẫn hoặc SKU này đã được sử dụng.')
    assert.isNull(await Product.findBy('slug', 'conflict'))
    const invalidImage = await client
      .post('/admin/products')
      .loginAs(staff)
      .withCsrfToken()
      .header('Accept', 'application/json')
      .header('Accept-Language', 'vi')
      .json({
        ...input,
        slug: 'bad-image',
        variants: [{ sku: 'NEW', price: '1', selections: [] }],
        images: [{ storageKey: '../secret.svg', altText: 'Image', isPrimary: true }],
      })
    invalidImage.assertStatus(422)
    assert.include(invalidImage.text(), 'Dùng khóa ảnh tương đối')
  })

  test('public catalog and multi-image product pages render through SSR in both locales', async ({
    client,
    assert,
  }) => {
    const images = [
      { storageKey: 'catalog/notebook.svg', altText: 'Notebook cover', isPrimary: true },
      { storageKey: 'catalog/model-kit.svg', altText: 'Notebook detail', isPrimary: false },
    ]
    await new CreateProduct().execute({ ...input, images }, 'VND', 'en')
    for (const locale of ['en', 'vi']) {
      const listing = await client
        .get('/products')
        .header('Accept', 'text/html')
        .header('Accept-Language', locale)
      listing.assertStatus(200)
      assert.include(listing.text(), 'Notebook')
      assert.equal(pageData(listing.text()).component, 'storefront/catalog')
      const detail = await client
        .get('/products/notebook')
        .header('Accept', 'text/html')
        .header('Accept-Language', locale)
      detail.assertStatus(200)
      const page = pageData(detail.text())
      assert.lengthOf(page.props.product.images, 2)
      assert.equal(page.props.locale, locale)
      assert.include(detail.text(), 'BOOK-1')
      assert.include(detail.text(), '/media/catalog/notebook.svg')
    }
  })

  test('locale selection preserves catalog routes and rejects external redirect destinations', async ({
    client,
  }) => {
    for (const [destination, expected] of [
      ['/products/notebook', '/products/notebook'],
      [
        '/products?q=coffee&category=coffee&inStock=1&page=2',
        '/products?q=coffee&category=coffee&inStock=1&page=2',
      ],
      ['/products?redirect=https://example.test', '/products'],
      ['/admin/products/12/edit', '/admin/products/12/edit'],
      ['https://example.test', '/'],
      ['//example.test', '/'],
    ]) {
      const response = await client
        .post('/locale')
        .withCsrfToken()
        .redirects(0)
        .json({ locale: 'vi', destination })
      response.assertStatus(302)
      response.assertHeader('location', expected)
    }
  })
})
