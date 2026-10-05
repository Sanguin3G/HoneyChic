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
import StoreSetting from '#core/store/store_setting'

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

    const seeded = 'catalog/keyboard.jpg'
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

function pageProps(html: string) {
  const data = html.match(/<script[^>]*data-page="[^"]*"[^>]*>([\s\S]*?)<\/script>/)?.[1]
  if (!data) throw new Error('Missing Inertia page data')
  return JSON.parse(data).props
}

function storeBody(extra: Record<string, unknown> = {}) {
  return {
    name: 'Brand Shop',
    description: 'Hue gifts and stationery',
    email: 'brand@example.test',
    phone: '0901000000',
    address: '12 Le Loi',
    currency: 'VND',
    defaultLocale: 'vi',
    timezone: 'Asia/Ho_Chi_Minh',
    orderPrefix: 'HCX',
    lowStockThreshold: 4,
    customerAccountsEnabled: true,
    registrationEnabled: true,
    guestCheckoutEnabled: true,
    logoKey: null,
    faviconKey: null,
    website: 'https://brand.example.test/shop',
    facebook: null,
    instagram: null,
    youtube: null,
    tiktok: null,
    primaryColor: '#112233',
    accentColor: null,
    ...extra,
  }
}

test.group('Store branding', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())
  group.each.teardown(() =>
    rm(app.makePath('public', 'media', 'uploads'), { recursive: true, force: true })
  )

  test('only the owner can upload a brand image', async ({ client, assert }) => {
    const owner = await User.create({
      fullName: 'Owner',
      email: 'brand-owner@example.test',
      password: 'test-password-123456',
      role: 'owner',
    })
    const staff = await User.create({
      fullName: 'Staff',
      email: 'brand-staff@example.test',
      password: 'test-password-123456',
      role: 'staff',
    })
    const customer = await User.create({
      fullName: 'Customer',
      email: 'brand-customer@example.test',
      password: 'test-password-123456',
      role: 'customer',
    })
    for (const actor of [staff, customer]) {
      const denied = await client
        .post('/admin/settings/images')
        .file('image', png, { filename: 'logo.png', contentType: 'image/png' })
        .loginAs(actor)
        .withCsrfToken()
        .header('Accept', 'application/json')
      denied.assertStatus(403)
    }
    const svg = await client
      .post('/admin/settings/images')
      .file('image', Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"></svg>'), {
        filename: 'logo.svg',
        contentType: 'image/svg+xml',
      })
      .loginAs(owner)
      .withCsrfToken()
      .header('Accept', 'application/json')
      .header('Accept-Language', 'vi')
    svg.assertStatus(422)
    assert.include(svg.text(), 'Tải ảnh JPEG')

    const uploaded = await client
      .post('/admin/settings/images')
      .file('image', png, { filename: '../logo.png', contentType: 'image/png' })
      .loginAs(owner)
      .withCsrfToken()
      .header('Accept', 'application/json')
    uploaded.assertStatus(200)
    const key = uploaded.body().storageKey as string
    assert.match(key, /^uploads\/[0-9a-f-]{36}\.png$/)
    assert.equal(uploaded.body().url, '/media/' + key)
    assert.notInclude(key, '..')
    assert.isTrue(await stored(key))
  })

  test('branding is public and a generated file stays while a product or brand field uses it', async ({
    client,
    assert,
  }) => {
    const owner = await User.create({
      fullName: 'Owner',
      email: 'brand-owner@example.test',
      password: 'test-password-123456',
      role: 'owner',
    })
    const staff = await User.create({
      fullName: 'Staff',
      email: 'brand-staff@example.test',
      password: 'test-password-123456',
      role: 'staff',
    })
    async function upload() {
      const response = await client
        .post('/admin/settings/images')
        .file('image', png, { filename: 'logo.png', contentType: 'image/png' })
        .loginAs(owner)
        .withCsrfToken()
        .header('Accept', 'application/json')
      response.assertStatus(200)
      return response.body().storageKey as string
    }
    const logo = await upload()
    const favicon = await upload()
    const replacement = await upload()
    const saved = await client
      .put('/admin/settings')
      .loginAs(owner)
      .withCsrfToken()
      .redirects(0)
      .json(storeBody({ logoKey: logo, faviconKey: favicon }))
    saved.assertStatus(302)
    const home = await client.get('/').header('Accept', 'text/html')
    home.assertStatus(200)
    const store = pageProps(home.text()).store
    assert.equal(store.name, 'Brand Shop')
    assert.equal(store.email, 'brand@example.test')
    assert.equal(store.phone, '0901000000')
    assert.equal(store.address, '12 Le Loi')
    assert.equal(store.description, 'Hue gifts and stationery')
    assert.equal(store.logoUrl, '/media/' + logo)
    assert.equal(store.faviconUrl, '/media/' + favicon)
    assert.equal(store.website, 'https://brand.example.test/shop')
    assert.equal(store.primaryColor, '#112233')
    assert.isNull(store.accentColor)
    assert.notProperty(store, 'orderPrefix')
    assert.notProperty(store, 'lowStockThreshold')
    assert.notProperty(store, 'registrationEnabled')
    assert.notProperty(store, 'logoKey')
    const html = home.text()
    assert.include(html, '/media/' + logo)
    assert.include(html, '/media/' + favicon)
    assert.include(html, 'mailto:brand@example.test')
    assert.include(html, 'Hue gifts and stationery')
    assert.include(html, 'https://brand.example.test/shop')
    assert.include(html, 'Trang web')
    assert.match(html, /data-brand="store"[^>]*>:root \{ --brand-primary: #112233; \}/)
    assert.notMatch(html, /data-brand="store"[^>]*>[^<]*brand-accent/)
    assert.notInclude(html, 'HCX')

    const invalid = await client
      .put('/admin/settings')
      .loginAs(owner)
      .withCsrfToken()
      .header('Accept', 'application/json')
      .header('Accept-Language', 'vi')
      .json(
        storeBody({
          name: 'Hacked',
          logoKey: replacement,
          website: 'http://brand.example.test',
          primaryColor: '#fff',
        })
      )
    invalid.assertStatus(422)
    assert.include(invalid.text(), 'Nhập liên kết https')
    assert.include(invalid.text(), 'Nhập màu dạng')
    const unchanged = await StoreSetting.findOrFail(1)
    assert.equal(unchanged.name, 'Brand Shop')
    assert.equal(unchanged.logoKey, logo)
    assert.isTrue(await stored(logo))
    assert.isTrue(await stored(replacement))

    const lowContrast = await client
      .put('/admin/settings')
      .loginAs(owner)
      .withCsrfToken()
      .header('Accept', 'application/json')
      .header('Accept-Language', 'en')
      .json(storeBody({ primaryColor: '#ffffff' }))
    lowContrast.assertStatus(422)
    assert.include(lowContrast.text(), '4.5:1')
    await unchanged.refresh()
    assert.equal(unchanged.primaryColor, '#112233')

    const formRejected = await client
      .put('/admin/settings')
      .loginAs(owner)
      .withCsrfToken()
      .redirects(1)
      .header('Accept', 'text/html')
      .header('Accept-Language', 'en')
      .json(storeBody({ primaryColor: '#ffffff' }))
    formRejected.assertStatus(200)
    assert.include(pageProps(formRejected.text()).errors.primaryColor, '4.5:1')

    const product = await new CreateProduct().execute(
      definition('brand-shared', 'BRAND-1', logo),
      'VND',
      'en'
    )
    const variantId = await firstVariantId(product.id)
    const replaced = await client
      .put('/admin/settings')
      .loginAs(owner)
      .withCsrfToken()
      .redirects(0)
      .json(storeBody({ logoKey: replacement, faviconKey: favicon }))
    replaced.assertStatus(302)
    assert.isTrue(await stored(logo))
    assert.isTrue(await stored(replacement))
    const removeImage = await client
      .put('/admin/products/' + product.id)
      .loginAs(staff)
      .withCsrfToken()
      .redirects(0)
      .json(definition('brand-shared', 'BRAND-1', undefined, variantId))
    removeImage.assertStatus(302)
    assert.isFalse(await stored(logo))
    assert.isTrue(await stored(favicon))

    const cleared = await client
      .put('/admin/settings')
      .loginAs(owner)
      .withCsrfToken()
      .redirects(0)
      .json(
        storeBody({
          logoKey: null,
          faviconKey: null,
          primaryColor: null,
          accentColor: null,
          website: null,
        })
      )
    cleared.assertStatus(302)
    assert.isFalse(await stored(favicon))
    assert.isFalse(await stored(replacement))
    const plain = await client.get('/').header('Accept', 'text/html')
    assert.include(plain.text(), '/favicon.svg')
    assert.notInclude(plain.text(), 'data-brand')
    assert.notInclude(plain.text(), '/media/' + replacement)
  })
})
