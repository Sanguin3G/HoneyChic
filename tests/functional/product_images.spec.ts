import { randomUUID } from 'node:crypto'
import { rm } from 'node:fs/promises'
import { test } from '@japa/runner'
import app from '@adonisjs/core/services/app'
import testUtils from '@adonisjs/core/services/test_utils'
import drive from '@adonisjs/drive/services/main'
import User from '#domains/customers/models/user'
import Product from '#domains/catalog/models/product'
import CreateProduct from '#domains/catalog/actions/create_product'
import { loadProduct } from '#domains/catalog/queries/load_product'

const png = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64'
)

async function stored(key: string) {
  const disk = drive.use()
  return disk.exists(key)
}

async function firstVariantId(productId: number) {
  const product = await loadProduct(productId)
  return product.variants[0].id
}

function definition(slug: string, sku: string, storageKey?: string, variantId?: number) {
  return {
    name: slug,
    slug,
    description: '',
    categoryId: null,
    status: 'published' as const,
    options: [],
    variants: [{ id: variantId, sku, price: '10', selections: [] as string[] }],
    images: storageKey ? [{ storageKey, altText: 'Product image', isPrimary: true }] : [],
  }
}

test.group('Product image uploads', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())
  group.each.teardown(() =>
    rm(app.makePath('public', 'media', 'uploads'), { recursive: true, force: true })
  )

  test('staff upload stores a generated key and rejects unsafe files', async ({
    client,
    assert,
  }) => {
    const staff = await User.create({
      fullName: 'Staff',
      email: 'staff@images.test',
      password: 'test-password-123456',
      role: 'staff',
    })
    const customer = await User.create({
      fullName: 'Customer',
      email: 'customer@images.test',
      password: 'test-password-123456',
      role: 'customer',
    })
    const denied = await client
      .post('/admin/products/images')
      .file('image', png, { filename: 'photo.png', contentType: 'image/png' })
      .loginAs(customer)
      .withCsrfToken()
      .header('Accept', 'application/json')
    denied.assertStatus(403)

    const svg = await client
      .post('/admin/products/images')
      .file('image', Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"></svg>'), {
        filename: 'icon.svg',
        contentType: 'image/svg+xml',
      })
      .loginAs(staff)
      .withCsrfToken()
      .header('Accept', 'application/json')
      .header('Accept-Language', 'vi')
    svg.assertStatus(422)
    assert.include(svg.text(), 'Tải ảnh JPEG')

    const oversized = await client
      .post('/admin/products/images')
      .file('image', Buffer.concat([png, Buffer.alloc(5 * 1024 * 1024)]), {
        filename: 'large.png',
        contentType: 'image/png',
      })
      .loginAs(staff)
      .withCsrfToken()
      .header('Accept', 'application/json')
    oversized.assertStatus(422)
    assert.include(oversized.text(), '5 MB')

    const uploaded = await client
      .post('/admin/products/images')
      .file('image', png, { filename: '../evil.png', contentType: 'image/png' })
      .loginAs(staff)
      .withCsrfToken()
      .header('Accept', 'application/json')
    uploaded.assertStatus(200)
    const key = uploaded.body().storageKey as string
    assert.match(key, /^uploads\/[0-9a-f-]{36}\.png$/)
    assert.notInclude(uploaded.text(), 'evil')
    assert.equal(uploaded.body().url, '/media/' + key)
    assert.isTrue(await stored(key))
    assert.notInclude(key, '..')
  })

  test('replacement deletes the old upload only after commit', async ({ client, assert }) => {
    const staff = await User.create({
      fullName: 'Staff',
      email: 'staff@images.test',
      password: 'test-password-123456',
      role: 'staff',
    })
    async function upload() {
      const response = await client
        .post('/admin/products/images')
        .file('image', png, { filename: 'photo.png', contentType: 'image/png' })
        .loginAs(staff)
        .withCsrfToken()
        .header('Accept', 'application/json')
      response.assertStatus(200)
      return response.body().storageKey as string
    }
    const current = await upload()
    const failed = await upload()
    const replacement = await upload()
    const created = await client
      .post('/admin/products')
      .loginAs(staff)
      .withCsrfToken()
      .redirects(0)
      .json(definition('image-product', 'IMG-1', current))
    created.assertStatus(302)
    await client
      .post('/admin/products')
      .loginAs(staff)
      .withCsrfToken()
      .redirects(0)
      .json(definition('other-product', 'IMG-TAKEN'))
    const product = await Product.findByOrFail('slug', 'image-product')
    const currentVariant = await firstVariantId(product.id)
    const conflict = await client
      .put('/admin/products/' + product.id)
      .loginAs(staff)
      .withCsrfToken()
      .redirects(0)
      .header('Accept', 'application/json')
      .json(definition('image-product', 'IMG-TAKEN', failed, currentVariant))
    conflict.assertStatus(422)
    assert.isTrue(await stored(current))
    assert.isFalse(await stored(failed))
    const unchanged = await loadProduct(product.id)
    assert.equal(unchanged.images[0].storageKey, current)

    const saved = await client
      .put('/admin/products/' + product.id)
      .loginAs(staff)
      .withCsrfToken()
      .redirects(0)
      .json(definition('image-product', 'IMG-1', replacement, currentVariant))
    saved.assertStatus(302)
    assert.isFalse(await stored(current))
    assert.isTrue(await stored(replacement))
    const page = await client.get('/products/image-product').header('Accept', 'text/html')
    page.assertStatus(200)
    assert.include(page.text(), '/media/' + replacement)
    assert.notInclude(page.text(), '/media/' + current)
  })

  test('shared uploads and seeded catalog files stay until nothing references them', async ({
    client,
    assert,
  }) => {
    const staff = await User.create({
      fullName: 'Staff',
      email: 'staff@images.test',
      password: 'test-password-123456',
      role: 'staff',
    })
    const shared = `uploads/${randomUUID()}.png`
    const disk = drive.use()
    await disk.put(shared, png)
    const first = await new CreateProduct().execute(
      definition('shared-one', 'SHARE-1', shared),
      'VND',
      'en'
    )
    const second = await new CreateProduct().execute(
      definition('shared-two', 'SHARE-2', shared),
      'VND',
      'en'
    )
    const firstVariant = await firstVariantId(first.id)
    const secondVariant = await firstVariantId(second.id)
    const removeFirst = await client
      .put('/admin/products/' + first.id)
      .loginAs(staff)
      .withCsrfToken()
      .redirects(0)
      .json(definition('shared-one', 'SHARE-1', undefined, firstVariant))
    removeFirst.assertStatus(302)
    assert.isTrue(await stored(shared))
    const removeSecond = await client
      .put('/admin/products/' + second.id)
      .loginAs(staff)
      .withCsrfToken()
      .redirects(0)
      .json(definition('shared-two', 'SHARE-2', undefined, secondVariant))
    removeSecond.assertStatus(302)
    assert.isFalse(await stored(shared))

    const seeded = 'catalog/keyboard.svg'
    assert.isTrue(await stored(seeded))
    const demo = await new CreateProduct().execute(
      definition('seeded-image', 'SEED-1', seeded),
      'VND',
      'en'
    )
    const demoVariant = await firstVariantId(demo.id)
    const removeSeed = await client
      .put('/admin/products/' + demo.id)
      .loginAs(staff)
      .withCsrfToken()
      .redirects(0)
      .json(definition('seeded-image', 'SEED-1', undefined, demoVariant))
    removeSeed.assertStatus(302)
    assert.isTrue(await stored(seeded))
    const cleared = await loadProduct(demo.id)
    assert.lengthOf(cleared.images, 0)
  })
})
