import { test } from '@japa/runner'
import { randomUUID } from 'node:crypto'
import testUtils from '@adonisjs/core/services/test_utils'
import db from '@adonisjs/lucid/services/db'
import StoreSetting from '#core/store/store_setting'
import User from '#domains/customers/models/user'
import Order from '#domains/orders/models/order'
import ProductVariant from '#domains/catalog/models/product_variant'
import InventoryMovement from '#domains/inventory/models/inventory_movement'
import PlaceOrder from '#domains/orders/actions/place_order'
import AdjustInventory from '#domains/inventory/actions/adjust_inventory'
import CancelOrder from '#domains/orders/actions/cancel_order'
import ChangeOrderStatus from '#domains/orders/actions/change_order_status'
import { orderDetail } from '#domains/orders/data/order_data'
import { cartFixture, repriceCartProduct, inertiaPage } from '../support/cart_fixture.js'
const details = (total = 1000) => ({
  token: randomUUID(),
  customerName: 'Order Customer',
  customerEmail: 'orders@example.test',
  customerPhone: '0123456789',
  deliveryAddress: '12 Example Street',
  note: '',
  expectedTotalMinor: total,
})
test.group('Checkout and historical orders', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())
  test('checkout uses authoritative prices, snapshots data and retries without duplicate stock writes', async ({
    assert,
  }) => {
    const { variants, product } = await cartFixture()
    const input = details(2200)
    const state = {
      currency: 'USD',
      lines: [[variants[0].id, 2, 1000] as [number, number, number]],
    }
    await repriceCartProduct(product.id, '11')
    await assert.rejects(() =>
      new PlaceOrder().execute(state, { ...input, expectedTotalMinor: 1 }, null, 'en')
    )
    const record0 = await ProductVariant.findOrFail(variants[0].id)
    assert.equal(record0.stock, 5)
    const action = new PlaceOrder()
    const order = await action.execute(state, input, null, 'en', {
      currency: 'USD',
      lines: [[variants[0].id, 2, 1100]],
    })
    const retry = await action.execute({ currency: null, lines: [] }, input, null, 'en')
    assert.equal(order.id, retry.id)
    assert.equal(order.totalMinor, 2200)
    const record1 = await ProductVariant.findOrFail(variants[0].id)
    assert.equal(record1.stock, 3)
    await repriceCartProduct(product.id, '20')
    await product.merge({ name: 'New name' }).save()
    await order.load('items')
    const snapshot = orderDetail(order)
    assert.equal(snapshot.items[0].unitPriceMinor, 1100)
    assert.equal(snapshot.items[0].productName, 'cart-keyboard')
    assert.equal(snapshot.customerEmail, input.customerEmail)
    assert.equal(order.paymentStatus, 'unpaid')
    assert.lengthOf(await InventoryMovement.query().where('reason', 'sale'), 1)
  })
  test('offsetting unit-price changes require another review even when the total is unchanged', async ({
    assert,
  }) => {
    const { variants } = await cartFixture()
    const cart = {
      currency: 'USD',
      lines: [
        [variants[0].id, 1, 1000],
        [variants[1].id, 1, 1000],
      ] as [number, number, number][],
    }
    await variants[0].merge({ priceMinor: 900 }).save()
    await variants[1].merge({ priceMinor: 1100 }).save()
    await assert.rejects(() => new PlaceOrder().execute(cart, details(2000), null, 'en'))
    assert.lengthOf(await Order.all(), 0)
    const current = {
      currency: 'USD',
      lines: [
        [variants[0].id, 1, 900],
        [variants[1].id, 1, 1100],
      ] as [number, number, number][],
    }
    const order = await new PlaceOrder().execute(cart, details(2000), null, 'en', current)
    assert.equal(order.totalMinor, 2000)
  })
  test('a failed multi-line checkout rolls back every order and inventory mutation', async ({
    assert,
  }) => {
    const { variants } = await cartFixture()
    const state = {
      currency: 'USD',
      lines: [
        [variants[0].id, 2, 1000],
        [variants[1].id, 6, 1000],
      ] as [number, number, number][],
    }
    await assert.rejects(() => new PlaceOrder().execute(state, details(8000), null, 'en'))
    const record2 = await ProductVariant.findOrFail(variants[0].id)
    assert.equal(record2.stock, 5)
    assert.lengthOf(await Order.all(), 0)
    assert.lengthOf(await InventoryMovement.query().where('reason', 'sale'), 0)
  })
  test('guest capability, visibility, currency and overflow are enforced by the business action', async ({
    assert,
  }) => {
    const { variants, product } = await cartFixture()
    const state = {
      currency: 'USD',
      lines: [[variants[0].id, 1, 1000]] as [number, number, number][],
    }
    const store = await StoreSetting.findOrFail(1)
    await store.merge({ guestCheckoutEnabled: false }).save()
    await assert.rejects(() => new PlaceOrder().execute(state, details(), null, 'en'))
    await store.merge({ guestCheckoutEnabled: true }).save()
    await product.merge({ status: 'draft' }).save()
    await assert.rejects(() => new PlaceOrder().execute(state, details(), null, 'en'))
    await product.merge({ status: 'published' }).save()
    await assert.rejects(() =>
      new PlaceOrder().execute({ ...state, currency: 'VND' }, details(), null, 'en')
    )
    await variants[0].merge({ priceMinor: Number.MAX_SAFE_INTEGER }).save()
    await assert.rejects(() =>
      new PlaceOrder().execute(
        { ...state, lines: [[variants[0].id, 2, 1000]] },
        details(),
        null,
        'en'
      )
    )
    assert.lengthOf(await Order.all(), 0)
  })
  test('cancellation restores stock once including a variant retired after sale; ownership and state are checked', async ({
    assert,
  }) => {
    const { variants } = await cartFixture('cancel-item', 'USD', '10', 1)
    const customer = await User.create({
      fullName: 'Customer',
      email: 'cancel@example.test',
      password: 'test-password-123456',
      role: 'customer',
    })
    const order = await new PlaceOrder().execute(
      { currency: 'USD', lines: [[variants[0].id, 1, 1000]] },
      details(),
      customer.id,
      'en'
    )
    await assert.rejects(() =>
      new CancelOrder().execute(order.publicId, { id: customer.id + 1, admin: false }, 'en')
    )
    await variants[0].refresh()
    await variants[0].merge({ isActive: false }).save()
    const action = new CancelOrder()
    await action.execute(order.publicId, { id: customer.id, admin: false }, 'en')
    await action.execute(order.publicId, { id: customer.id, admin: false }, 'en')
    const record3 = await ProductVariant.findOrFail(variants[0].id)
    assert.equal(record3.stock, 1)
    assert.lengthOf(await InventoryMovement.query().where('reason', 'cancellation'), 1)
    await new AdjustInventory().execute(
      { variantId: variants[0].id, quantityDelta: -1, reason: 'correction', actorId: customer.id },
      'en'
    )
    const record4 = await ProductVariant.findOrFail(variants[0].id)
    assert.equal(record4.stock, 0)
    await assert.rejects(() =>
      new ChangeOrderStatus().execute(order.publicId, 'processing', customer.id, 'en')
    )
  })
  test('a failed cancellation rolls back earlier restorations and leaves the order pending', async ({
    assert,
  }) => {
    const { variants } = await cartFixture()
    const order = await new PlaceOrder().execute(
      {
        currency: 'USD',
        lines: [
          [variants[0].id, 1, 1000],
          [variants[1].id, 1, 1000],
        ],
      },
      details(2000),
      null,
      'en'
    )
    await new AdjustInventory().execute(
      { variantId: variants[1].id, quantityDelta: 2147483643, reason: 'restock', actorId: null },
      'en'
    )
    await assert.rejects(() =>
      new CancelOrder().execute(order.publicId, { id: null, admin: true }, 'en')
    )
    const first = await ProductVariant.findOrFail(variants[0].id)
    const second = await ProductVariant.findOrFail(variants[1].id)
    await order.refresh()
    assert.equal(first.stock, 4)
    assert.equal(second.stock, 2147483647)
    assert.equal(order.status, 'pending')
    assert.lengthOf(await InventoryMovement.query().where('reason', 'cancellation'), 0)
  })
  test('history survives deletion of live customer and catalog references', async ({ assert }) => {
    const { variants, product } = await cartFixture()
    const customer = await User.create({
      fullName: 'Historical customer',
      email: 'history@example.test',
      password: 'test-password-123456',
      role: 'customer',
    })
    const order = await new PlaceOrder().execute(
      { currency: 'USD', lines: [[variants[0].id, 1, 1000]] },
      details(),
      customer.id,
      'en'
    )
    await new ChangeOrderStatus().execute(order.publicId, 'processing', customer.id, 'en')
    await new ChangeOrderStatus().execute(order.publicId, 'completed', customer.id, 'en')
    await customer.delete()
    await db
      .from('inventory_movements')
      .whereIn(
        'product_variant_id',
        variants.map((variant) => variant.id)
      )
      .delete()
    await db.from('product_variants').where('product_id', product.id).delete()
    await db.from('product_options').where('product_id', product.id).delete()
    await db.from('product_images').where('product_id', product.id).delete()
    await product.delete()
    await order.refresh()
    await order.load('items')
    assert.isNull(order.customerId)
    assert.isNull(order.items[0].productId)
    assert.isNull(order.items[0].productVariantId)
    assert.equal(order.items[0].productName, 'cart-keyboard')
    assert.equal(order.totalMinor, 1000)
    await assert.rejects(() =>
      new CancelOrder().execute(order.publicId, { id: null, admin: true }, 'en')
    )
  })
  test('guest receipts and customer order history do not leak across sessions or accounts', async ({
    client,
    assert,
  }) => {
    const { variants } = await cartFixture()
    const input = details()
    const cart = { currency: 'USD', lines: [[variants[0].id, 1, 1000]] }
    const placed = await client
      .post('/checkout')
      .withCsrfToken()
      .withSession({ cart, checkoutToken: input.token, checkoutReview: cart })
      .redirects(0)
      .json({ ...input, totalMinor: 1 })
    placed.assertStatus(302)
    const url = placed.header('location')!
    const receipt = await client
      .get(url)
      .withSession(placed.session())
      .header('Accept', 'text/html')
    receipt.assertStatus(200)
    assert.equal(inertiaPage(receipt.text()).props.order.totalMinor, 1000)
    const newCart = { currency: 'USD', lines: [[variants[1].id, 1, 1000]] }
    const repeated = await client
      .post('/checkout')
      .withCsrfToken()
      .withSession({ ...placed.session(), cart: newCart })
      .redirects(0)
      .json(input)
    repeated.assertStatus(302)
    repeated.assertSession('cart', newCart)
    const denied = await client.get(url).header('Accept', 'application/json')
    denied.assertStatus(404)
    const customer = await User.create({
      fullName: 'Other',
      email: 'other-order@example.test',
      password: 'test-password-123456',
      role: 'customer',
    })
    const other = await client.get(url).loginAs(customer).header('Accept', 'application/json')
    other.assertStatus(404)
    const cancelled = await client
      .post(url + '/cancel')
      .withSession(placed.session())
      .withCsrfToken()
      .redirects(0)
    cancelled.assertStatus(302)
    const record5 = await ProductVariant.findOrFail(variants[0].id)
    assert.equal(record5.stock, 5)
    const bad = await client
      .post('/checkout')
      .withCsrfToken()
      .withSession({ cart, checkoutToken: randomUUID() })
      .header('Accept', 'application/json')
      .json(input)
    bad.assertStatus(422)
  })
})
