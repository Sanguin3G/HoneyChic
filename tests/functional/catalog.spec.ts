import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import CreateProduct from '#domains/catalog/actions/create_product'
import UpdateProduct from '#domains/catalog/actions/update_product'
import { loadProduct, loadPublishedProduct } from '#domains/catalog/queries/load_product'
import SearchCatalog from '#domains/catalog/queries/search_catalog'
import Product from '#domains/catalog/models/product'
import ProductVariant from '#domains/catalog/models/product_variant'
import Category from '#domains/catalog/models/category'
import StoreSetting from '#core/store/store_setting'
import { productEditor } from '#domains/catalog/data/product_data'
import type { ProductInput } from '#domains/catalog/validators/catalog'
import { parsePrice, decimalPrice, formatMoney } from '#shared/money'

function simple(slug = 'coffee'): ProductInput {
  return {
    name: 'Cà phê Đà Lạt',
    slug,
    description: 'Merchant text unchanged.',
    categoryId: null,
    status: 'published',
    options: [],
    images: [],
    variants: [{ sku: slug.toUpperCase(), price: '19.99', selections: [] }],
  }
}
test.group('Catalog integrity', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('prices parse and format exactly for USD, EUR and zero-fraction VND', ({ assert }) => {
    assert.equal(parsePrice('0.29', 'USD'), 29)
    assert.equal(parsePrice('19.99', 'EUR'), 1999)
    assert.equal(parsePrice('125000', 'VND'), 125000)
    assert.equal(decimalPrice(29, 'USD'), '0.29')
    assert.equal(decimalPrice(Number.MAX_SAFE_INTEGER, 'USD'), '90071992547409.91')
    assert.equal(formatMoney(Number.MAX_SAFE_INTEGER, 'USD', 'en'), '$90,071,992,547,409.91')
    assert.include(formatMoney(125000, 'VND', 'vi'), '125.000')
    for (const [amount, currency] of [
      ['1.001', 'USD'],
      ['1.0', 'VND'],
      ['-1', 'USD'],
      ['9007199254740992', 'VND'],
    ]) {
      assert.throws(() => parsePrice(amount, currency))
    }
  })

  test('simple products have a default variant and exact persisted price', async ({ assert }) => {
    const product = await new CreateProduct().execute(simple(), 'USD', 'en')
    const loaded = await loadProduct(product.id)
    assert.lengthOf(loaded.variants, 1)
    assert.equal(loaded.variants[0].priceMinor, 1999)
    assert.equal(loaded.variants[0].combinationKey, '[]')
    assert.equal(loaded.description, simple().description)
  })

  test('invalid combinations and duplicate SKUs do not leave partial products', async ({
    assert,
  }) => {
    const action = new CreateProduct()
    await action.execute(simple(), 'USD', 'en')
    await assert.rejects(() =>
      action.execute(
        {
          ...simple('duplicate'),
          variants: simple().variants,
        },
        'USD',
        'en'
      )
    )
    assert.isNull(await Product.findBy('slug', 'duplicate'))
    await assert.rejects(() =>
      action.execute(
        {
          ...simple('invalid'),
          options: [{ name: 'Grind', values: ['Whole bean'] }],
        },
        'USD',
        'en'
      )
    )
    assert.isNull(await Product.findBy('slug', 'invalid'))
  })

  test('variant updates keep identities and currency, and retire omitted SKUs', async ({
    assert,
  }) => {
    const input: ProductInput = {
      ...simple(),
      options: [{ name: 'Grind', values: ['Whole bean', 'Filter'] }],
      variants: [
        { sku: 'BEANS', price: '10.25', selections: ['Whole bean'] },
        { sku: 'FILTER', price: '11.25', selections: ['Filter'] },
      ],
    }
    const product = await new CreateProduct().execute(input, 'USD', 'en')
    const before = await loadProduct(product.id)
    assert.lengthOf(before.variants[0].optionValues, 1)
    const removedId = before.variants[1].id
    const changes = productEditor(before)
    changes.variants.splice(1)
    changes.variants[0].price = '12.29'
    const store = await StoreSetting.findOrFail(1)
    await store.merge({ currency: 'VND' }).save()
    await new UpdateProduct().execute(product.id, changes, 'en')
    const after = await loadProduct(product.id)
    assert.lengthOf(after.variants, 1)
    assert.equal(after.variants[0].id, before.variants[0].id)
    assert.equal(after.variants[0].priceMinor, 1229)
    assert.equal(after.variants[0].currency, 'USD')
    const retired = await ProductVariant.findOrFail(removedId)
    assert.isFalse(retired.isActive)
    await assert.rejects(() =>
      new CreateProduct().execute(
        {
          ...simple('reserved'),
          variants: [{ sku: 'FILTER', price: '1', selections: [] }],
        },
        'USD',
        'en'
      )
    )
    assert.isNull(await Product.findBy('slug', 'reserved'))
  })

  test('foreign variant IDs and conflicting images roll back the entire edit', async ({
    assert,
  }) => {
    const action = new CreateProduct()
    const first = await action.execute(simple(), 'USD', 'en')
    const other = await action.execute(simple('other'), 'USD', 'en')
    const input = productEditor(await loadProduct(first.id))
    input.name = 'Should not save'
    const otherProduct = await loadProduct(other.id)
    input.variants[0].id = otherProduct.variants[0].id
    await assert.rejects(() => new UpdateProduct().execute(first.id, input, 'en'))
    const unchanged = await Product.findOrFail(first.id)
    assert.equal(unchanged.name, simple().name)
    const images = [
      { storageKey: 'catalog/coffee.svg', altText: 'Coffee', isPrimary: true },
      { storageKey: 'catalog/coffee-detail.svg', altText: 'Detail', isPrimary: true },
    ]
    await assert.rejects(() => action.execute({ ...simple('images'), images }, 'USD', 'en'))
    assert.isNull(await Product.findBy('slug', 'images'))
  })

  test('publication and category visibility apply to search and direct product access', async ({
    assert,
    client,
  }) => {
    const category = await Category.create({
      name: 'Coffee',
      slug: 'coffee',
      description: '',
      isActive: true,
    })
    const action = new CreateProduct()
    const published = await action.execute({ ...simple(), categoryId: category.id }, 'USD', 'en')
    await action.execute({ ...simple('draft'), status: 'draft' }, 'USD', 'en')
    await action.execute({ ...simple('archived'), status: 'archived' }, 'USD', 'en')
    const search = new SearchCatalog()
    assert.lengthOf(await search.query({ q: 'Đà Lạt' }), 1)
    assert.lengthOf(await search.query({ q: 'COFFEE' }), 1)
    assert.lengthOf(await search.query({ q: '%' }), 0)
    assert.lengthOf(await search.query({ category: 'coffee' }), 1)
    const publicProduct = await loadPublishedProduct(published.slug)
    assert.equal(publicProduct.id, published.id)
    await category.merge({ isActive: false }).save()
    assert.lengthOf(await search.query({}), 0)
    await assert.rejects(() => loadPublishedProduct(published.slug))
    for (const slug of ['coffee', 'draft', 'archived']) {
      const response = await client.get('/products/' + slug).header('Accept', 'application/json')
      response.assertStatus(404)
    }
  })
})
