import { test } from '@japa/runner'
import { randomUUID } from 'node:crypto'
import db from '@adonisjs/lucid/services/db'
import type { HttpContext } from '@adonisjs/core/http'
import StoreSetting from '#core/store/store_setting'
import Order from '#domains/orders/models/order'
import ProductVariant from '#domains/catalog/models/product_variant'
import PlaceOrder from '#domains/orders/actions/place_order'
import CancelOrder from '#domains/orders/actions/cancel_order'
import Coupon from '#modules/coupons/models/coupon'
import Payment from '#modules/payments/models/payment'
import CreatePayment from '#modules/payments/actions/create_payment'
import SettlePayment from '#modules/payments/actions/settle_payment'
import CheckoutModules from '../../app/http/actions/checkout_modules.js'
import { cartFixture } from '../support/cart_fixture.js'
const details = (email: string, total: number) => ({
  token: randomUUID(),
  customerName: 'Race',
  customerEmail: email,
  customerPhone: '123',
  deliveryAddress: 'Test address',
  expectedTotalMinor: total,
})
async function clearOrders(email: string) {
  const orders = await Order.query().where('customerEmail', email)
  const ids = orders.map((order) => order.id)
  const payments = await Payment.query().whereIn('orderId', ids)
  await db
    .from('payment_events')
    .whereIn(
      'payment_id',
      payments.map((payment) => payment.id)
    )
    .delete()
  await db.from('payments').whereIn('order_id', ids).delete()
  await db.from('coupon_redemptions').whereIn('order_id', ids).delete()
  await db.from('order_items').whereIn('order_id', ids).delete()
  await db.from('orders').whereIn('id', ids).delete()
}
async function clearProduct(fixture: Awaited<ReturnType<typeof cartFixture>>) {
  await db
    .from('inventory_movements')
    .whereIn(
      'product_variant_id',
      fixture.variants.map((variant) => variant.id)
    )
    .delete()
  await db.from('product_variants').where('product_id', fixture.product.id).delete()
  await db.from('product_options').where('product_id', fixture.product.id).delete()
  await db.from('product_images').where('product_id', fixture.product.id).delete()
  await fixture.product.delete()
  await fixture.category.delete()
}
// Committed fixtures and independent transactions exercise actual PostgreSQL locks.
test('two different products cannot consume the same final coupon use', async ({ assert }) => {
  const suffix = randomUUID()
  const email = suffix + '@coupon-race.test'
  const store = await StoreSetting.findOrFail(1)
  const before = store.couponsEnabled
  await store.merge({ couponsEnabled: true }).save()
  const first = await cartFixture('coupon-a-' + suffix)
  const second = await cartFixture('coupon-b-' + suffix)
  const coupon = await Coupon.create({
    code: 'RACE-' + suffix.slice(0, 8).toUpperCase(),
    kind: 'fixed',
    currency: 'USD',
    value: 100,
    minimumMinor: 0,
    usageLimit: 1,
    uses: 0,
    isActive: true,
  })
  try {
    const ctx = { store, locale: 'en' } as HttpContext
    const results = await Promise.allSettled(
      [first, second].map((fixture) => {
        const state = {
          currency: 'USD',
          lines: [[fixture.variants[0].id, 1, 1000]] as [number, number, number][],
        }
        return new PlaceOrder().execute(
          state,
          details(email, 900),
          null,
          'en',
          state,
          new CheckoutModules(ctx, { country: '', couponCode: coupon.code })
        )
      })
    )
    assert.equal(results.filter((result) => result.status === 'fulfilled').length, 1)
    await coupon.refresh()
    assert.equal(coupon.uses, 1)
    const variants = await ProductVariant.query().whereIn('id', [
      first.variants[0].id,
      second.variants[0].id,
    ])
    assert.equal(
      variants.reduce((sum, variant) => sum + variant.stock, 0),
      9
    )
  } finally {
    await clearOrders(email)
    await coupon.delete()
    await clearProduct(first)
    await clearProduct(second)
    await store.merge({ couponsEnabled: before }).save()
  }
})
test('payment and cancellation race cannot produce a paid order with restored stock', async ({
  assert,
}) => {
  const suffix = randomUUID()
  const email = suffix + '@payment-race.test'
  const store = await StoreSetting.findOrFail(1)
  const before = store.fakePaymentEnabled
  await store.merge({ fakePaymentEnabled: true }).save()
  const fixture = await cartFixture('payment-race-' + suffix)
  try {
    const state = {
      currency: 'USD',
      lines: [[fixture.variants[0].id, 1, 1000]] as [number, number, number][],
    }
    const order = await new PlaceOrder().execute(state, details(email, 1000), null, 'en', state, {
      quote: async () => ({ discountMinor: 0, shippingMinor: 0, shippingName: '', couponCode: '' }),
      created: async (created, trx) => {
        await new CreatePayment().execute(created, 'fake', 'en', trx)
      },
    })
    const payment = await Payment.query().where('orderId', order.id).firstOrFail()
    const results = await Promise.allSettled([
      new SettlePayment().execute(
        payment.publicId,
        { reference: suffix, amountMinor: 1000, currency: 'USD' },
        { customerId: null, guestOrder: order.publicId, administrator: false },
        'en'
      ),
      new CancelOrder().execute(
        order.publicId,
        { id: null, guestOrder: order.publicId, admin: false },
        'en'
      ),
    ])
    assert.equal(results.filter((result) => result.status === 'fulfilled').length, 1)
    await order.refresh()
    const variant = await ProductVariant.findOrFail(fixture.variants[0].id)
    if (order.paymentStatus === 'paid') {
      assert.equal(order.status, 'pending')
      assert.equal(variant.stock, 4)
    } else {
      assert.equal(order.status, 'cancelled')
      assert.equal(variant.stock, 5)
    }
  } finally {
    await clearOrders(email)
    await clearProduct(fixture)
    await store.merge({ fakePaymentEnabled: before }).save()
  }
})
