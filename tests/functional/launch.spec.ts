import { test } from '@japa/runner'
import { randomUUID } from 'node:crypto'
import { DateTime } from 'luxon'
import testUtils from '@adonisjs/core/services/test_utils'
import mail from '@adonisjs/mail/services/main'
import StoreSetting from '#core/store/store_setting'
import User from '#domains/customers/models/user'
import Order from '#domains/orders/models/order'
import Product from '#domains/catalog/models/product'
import ProductVariant from '#domains/catalog/models/product_variant'
import InventoryMovement from '#domains/inventory/inventory_movement'
import PlaceOrder from '#domains/orders/actions/place_order'
import ExpireUnpaidOrders from '#domains/orders/actions/expire_unpaid_orders'
import ImportProducts from '#domains/catalog/product_csv'
import { firstRunCode } from '#domains/customers/first_run_code'
import { cartFixture } from '../support/cart_fixture.js'

async function placeOrder(variantId: number) {
  return new PlaceOrder().execute(
    { currency: 'USD', lines: [[variantId, 2, 1000]] },
    {
      token: randomUUID(),
      customerName: 'Expiry Customer',
      customerEmail: 'expiry@example.test',
      customerPhone: '0123456789',
      deliveryAddress: '1 Example Street',
      note: '',
      expectedTotalMinor: 2000,
    },
    null,
    'en'
  )
}

test.group('Unpaid order expiry', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())
  group.each.setup(() => {
    mail.fake()
    return () => mail.restore()
  })

  test('expires only old pending unpaid orders and restores stock once', async ({ assert }) => {
    const { variants } = await cartFixture('expiry-item', 'USD', '10', 10)
    const old = await placeOrder(variants[0].id)
    const recent = await placeOrder(variants[0].id)
    const paid = await placeOrder(variants[0].id)
    await old.merge({ createdAt: DateTime.utc().minus({ hours: 5 }) }).save()
    await paid
      .merge({ createdAt: DateTime.utc().minus({ hours: 5 }), paymentStatus: 'paid' })
      .save()
    const before = await ProductVariant.findOrFail(variants[0].id)
    assert.equal(before.stock, 4)

    const store = await StoreSetting.findOrFail(1)
    assert.lengthOf(await new ExpireUnpaidOrders().execute(), 0, 'no lifetime means no expiry')

    await store.merge({ unpaidOrderHours: 2 }).save()
    const expired = await new ExpireUnpaidOrders().execute()
    assert.deepEqual(
      expired.map((order) => order.id),
      [old.id]
    )
    const statuses = await Order.query().whereIn('id', [old.id, recent.id, paid.id]).orderBy('id')
    assert.deepEqual(
      statuses.map((order) => order.status),
      ['cancelled', 'pending', 'pending']
    )
    const after = await ProductVariant.findOrFail(variants[0].id)
    assert.equal(after.stock, 6)

    assert.lengthOf(await new ExpireUnpaidOrders().execute(), 0)
    const restores = await InventoryMovement.query()
      .where('reason', 'cancellation')
      .where('reference', old.number)
    assert.lengthOf(restores, 1)
  })
})

test.group('Product CSV import', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('creates products with variants and initial stock, skipping existing slugs', async ({
    assert,
  }) => {
    const owner = await User.create({
      fullName: 'Owner',
      email: 'owner@import.test',
      password: 'test-password-123456',
      role: 'owner',
    })
    await cartFixture('existing-item')
    const csv = [
      'name,slug,status,category,description,sku,options,price,stock',
      'Linen shirt,linen-shirt,published,Clothing,Soft,SHIRT-S,Size: S,25.50,3',
      'Linen shirt,linen-shirt,published,Clothing,Soft,SHIRT-M,Size: M,25.50,0',
      'Old thing,existing-item,published,,,OLD-1,,5,1',
    ].join('\n')
    const result = await new ImportProducts().execute(csv, 'USD', owner.id, 'en')
    assert.deepEqual(result, { created: 1, skipped: ['existing-item'], errors: [] })
    const product = await Product.query()
      .where('slug', 'linen-shirt')
      .preload('category')
      .preload('variants', (variants) => variants.orderBy('id'))
      .firstOrFail()
    assert.equal(product.category.name, 'Clothing')
    assert.deepEqual(
      product.variants.map((variant) => [variant.sku, variant.priceMinor, variant.stock]),
      [
        ['SHIRT-S', 2550, 3],
        ['SHIRT-M', 2550, 0],
      ]
    )
    const movement = await InventoryMovement.query()
      .where('productVariantId', product.variants[0].id)
      .firstOrFail()
    assert.equal(movement.reason, 'initial_stock')
    assert.equal(movement.actorId, owner.id)
  })

  test('imports nothing when any row is invalid', async ({ assert }) => {
    const owner = await User.create({
      fullName: 'Owner',
      email: 'owner@import.test',
      password: 'test-password-123456',
      role: 'owner',
    })
    const csv = ['name,sku,price,stock', 'Good item,GOOD-1,10,2', 'Bad price,BAD-1,ten,1'].join(
      '\n'
    )
    const result = await new ImportProducts().execute(csv, 'USD', owner.id, 'en')
    assert.equal(result.created, 0)
    assert.lengthOf(result.errors, 1)
    assert.include(result.errors[0], 'Row 3')
    assert.isNull(await Product.findBy('slug', 'good-item'))
  })
})

test.group('First-run owner setup', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('needs the setup code and works only until an owner exists', async ({ client, assert }) => {
    const input = {
      fullName: 'First Owner',
      email: 'first@owner.test',
      password: 'test-password-123456',
      password_confirmation: 'test-password-123456',
    }
    const wrong = await client
      .post('/welcome')
      .withCsrfToken()
      .header('Accept', 'application/json')
      .header('Accept-Language', 'vi')
      .json({ ...input, setupCode: '0000-0000-0000' })
    wrong.assertStatus(422)
    assert.include(wrong.text(), 'Mã thiết lập không khớp')
    assert.isNull(await User.findBy('role', 'owner'))

    const right = await client
      .post('/welcome')
      .withCsrfToken()
      .redirects(0)
      .json({ ...input, setupCode: firstRunCode() })
    right.assertStatus(302)
    right.assertHeader('location', '/admin/setup')
    const owner = await User.findByOrFail('role', 'owner')
    assert.equal(owner.email, 'first@owner.test')

    const again = await client
      .post('/welcome')
      .withCsrfToken()
      .redirects(0)
      .json({ ...input, email: 'second@owner.test', setupCode: firstRunCode() })
    again.assertHeader('location', '/login')
    assert.lengthOf(await User.query().where('role', 'owner'), 1)
  })
})
