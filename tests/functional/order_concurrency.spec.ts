import { test } from '@japa/runner'
import { randomUUID } from 'node:crypto'
import db from '@adonisjs/lucid/services/db'
import PlaceOrder from '#domains/orders/actions/place_order'
import ProductVariant from '#domains/catalog/models/product_variant'
import Order from '#domains/orders/models/order'
import { cartFixture } from '../support/cart_fixture.js'
// Independent committed connections: a global transaction cannot prove checkout races.
test('two checkouts cannot both purchase the last unit', async ({ assert }) => {
  const slug = 'checkout-' + randomUUID()
  const { product, variants, category } = await cartFixture(slug, 'USD', '10', 1)
  const state = {
    currency: 'USD',
    lines: [[variants[0].id, 1, 1000]] as [number, number, number][],
  }
  const input = {
    customerName: 'Concurrent customer',
    customerEmail: 'race@example.test',
    customerPhone: '123',
    deliveryAddress: 'Example address',
    note: '',
    expectedTotalMinor: 1000,
  }
  try {
    const results = await Promise.allSettled(
      [1, 2].map(() =>
        new PlaceOrder().execute(state, { ...input, token: randomUUID() }, null, 'en')
      )
    )
    assert.equal(results.filter((result) => result.status === 'fulfilled').length, 1)
    assert.equal(results.filter((result) => result.status === 'rejected').length, 1)
    const record0 = await ProductVariant.findOrFail(variants[0].id)
    assert.equal(record0.stock, 0)
    const orders = await Order.query().where('customerEmail', input.customerEmail)
    assert.lengthOf(orders, 1)
  } finally {
    const orders = await Order.query().where('customerEmail', input.customerEmail)
    await db
      .from('order_items')
      .whereIn(
        'order_id',
        orders.map((order) => order.id)
      )
      .delete()
    await db
      .from('orders')
      .whereIn(
        'id',
        orders.map((order) => order.id)
      )
      .delete()
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
    await category.delete()
  }
})
