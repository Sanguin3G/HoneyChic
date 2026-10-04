import { moduleFixture as setup } from '../support/module_fixture.js'
import { test } from '@japa/runner'
import { randomUUID } from 'node:crypto'
import testUtils from '@adonisjs/core/services/test_utils'
import { DateTime } from 'luxon'
import User from '#domains/customers/models/user'
import ProductVariant from '#domains/catalog/models/product_variant'
import Order from '#domains/orders/models/order'
import PlaceOrder from '#domains/orders/actions/place_order'
import CancelOrder from '#domains/orders/actions/cancel_order'
import ChangeOrderStatus from '#domains/orders/actions/change_order_status'
import Wishlist from '#modules/wishlist/models/wishlist'
import SaveWishlist from '#modules/wishlist/actions/save_wishlist'
import Review from '#modules/reviews/models/review'
import SaveReview from '#modules/reviews/actions/save_review'
import QuoteShipping from '#modules/shipping/actions/quote_shipping'
import ApplyCoupon from '#modules/coupons/actions/apply_coupon'
import Payment from '#modules/payments/models/payment'
import SettlePayment from '#modules/payments/actions/settle_payment'
import CheckoutModules from '../../app/http/actions/checkout_modules.js'
import { capabilitiesFor } from '#core/capabilities/capabilities'
test.group('Optional modules and transactional integration', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())
  test('wishlist is bounded, idempotent, scoped and disabled server-side', async ({
    assert,
    client,
  }) => {
    const f = await setup()
    await new SaveWishlist().execute(f.customer.id, f.product.slug, true, 'en')
    await new SaveWishlist().execute(f.customer.id, f.product.slug, true, 'en')
    assert.lengthOf(await Wishlist.all(), 1)
    const denied = await client
      .get('/account/wishlist')
      .header('Accept', 'application/json')
      .redirects(0)
    denied.assertStatus(401)
    await f.store.merge({ wishlistEnabled: false }).save()
    await assert.rejects(() =>
      new SaveWishlist().execute(f.customer.id, f.product.slug, false, 'en')
    )
    assert.lengthOf(await Wishlist.all(), 1)
  }).timeout(60_000)
  test('reviews and wishlist stay unconfigured when customer accounts are disabled', async ({
    assert,
  }) => {
    const f = await setup()
    await f.store.merge({ customerAccountsEnabled: false }).save()
    await f.store.refresh()
    const snapshot = capabilitiesFor(f.store)
    assert.isFalse(snapshot.reviews.configured)
    assert.isFalse(snapshot.wishlist.configured)
    assert.isFalse(snapshot.reviews.available)
    assert.isFalse(snapshot.wishlist.available)
  })
  test('reviews require an owned completed purchase and update one review per product', async ({
    assert,
    client,
  }) => {
    const f = await setup()
    const review = new SaveReview()
    await assert.rejects(() =>
      review.execute(f.customer.id, f.product.slug, { rating: 5, body: 'Good' }, 'en')
    )
    const order = await new PlaceOrder().execute(
      f.state,
      { ...f.input, expectedTotalMinor: 1000 },
      f.customer.id,
      'en'
    )
    await assert.rejects(() =>
      review.execute(f.customer.id, f.product.slug, { rating: 5, body: 'Good' }, 'en')
    )
    await new ChangeOrderStatus().execute(order.publicId, 'processing', f.customer.id, 'en')
    await new ChangeOrderStatus().execute(order.publicId, 'completed', f.customer.id, 'en')
    const submitted = await client
      .post('/account/reviews')
      .loginAs(f.customer)
      .withCsrfToken()
      .redirects(0)
      .json({ slug: f.product.slug, rating: 5, body: 'Good' })
    submitted.assertStatus(302)
    await review.execute(f.customer.id, f.product.slug, { rating: 4, body: 'Updated' }, 'en')
    const rows = await Review.all()
    assert.lengthOf(rows, 1)
    assert.equal(rows[0].body, 'Updated')
    const other = await User.create({
      fullName: 'Other',
      email: 'module-other@example.test',
      password: 'test-password-123456',
      role: 'customer',
    })
    await assert.rejects(() =>
      review.execute(other.id, f.product.slug, { rating: 5, body: 'Not purchased' }, 'en')
    )
  })
  test('shipping zones, thresholds and currency are authoritative; coupon arithmetic and dates are exact', async ({
    assert,
  }) => {
    const f = await setup()
    const shipping = new QuoteShipping()
    const standard = await shipping.execute(f.rate.id, 'VN', 1000, 'USD', 'en')
    assert.equal(standard.shippingMinor, 200)
    const free = await shipping.execute(f.rate.id, 'VN', 2000, 'USD', 'en')
    assert.equal(free.shippingMinor, 0)
    await assert.rejects(() => shipping.execute(f.rate.id, 'US', 1000, 'USD', 'en'))
    await assert.rejects(() => shipping.execute(f.rate.id, 'VN', 1000, 'VND', 'en'))
    await f.coupon.merge({ minimumMinor: 0 }).save()
    const applied = await new ApplyCoupon().execute('ten', 999, 'USD', 'en')
    assert.equal(applied.discountMinor, 99)
    await f.coupon.merge({ kind: 'fixed', value: 5000 }).save()
    const capped = await new ApplyCoupon().execute('TEN', 999, 'USD', 'en')
    assert.equal(capped.discountMinor, 999)
    await f.coupon.merge({ endsAt: DateTime.utc().minus({ days: 1 }) }).save()
    await assert.rejects(() => new ApplyCoupon().execute('TEN', 1000, 'USD', 'en'))
  })
  test('order, discount, shipping, coupon usage and payment commit once; exhausted coupon cannot sell another item', async ({
    assert,
  }) => {
    const f = await setup()
    const modules = new CheckoutModules(f.ctx, f.selections)
    const order = await new PlaceOrder().execute(
      f.state,
      f.input,
      f.customer.id,
      'en',
      f.state,
      modules
    )
    assert.equal(order.totalMinor, 1100)
    assert.equal(order.discountMinor, 100)
    assert.equal(order.shippingMinor, 200)
    assert.equal(order.shippingName, 'Local zone')
    const retry = await new PlaceOrder().execute(
      f.state,
      f.input,
      f.customer.id,
      'en',
      f.state,
      new CheckoutModules(f.ctx, f.selections)
    )
    assert.equal(retry.id, order.id)
    await f.coupon.refresh()
    assert.equal(f.coupon.uses, 1)
    assert.lengthOf(await Payment.all(), 1)
    await assert.rejects(() =>
      new PlaceOrder().execute(
        f.state,
        { ...f.input, token: randomUUID() },
        f.customer.id,
        'en',
        f.state,
        new CheckoutModules(f.ctx, f.selections)
      )
    )
    const variant = await ProductVariant.findOrFail(f.variants[0].id)
    assert.equal(variant.stock, 4)
  })
  test('failure after optional-module writes rolls back stock, order, coupon redemption and payment', async ({
    assert,
  }) => {
    const f = await setup()
    const modules = new CheckoutModules(f.ctx, f.selections)
    await assert.rejects(() =>
      new PlaceOrder().execute(f.state, f.input, f.customer.id, 'en', f.state, {
        quote: modules.quote.bind(modules),
        created: async (order, trx) => {
          await modules.created(order, trx)
          throw new Error('transaction failure')
        },
      })
    )
    assert.lengthOf(await Order.all(), 0)
    assert.lengthOf(await Payment.all(), 0)
    await f.coupon.refresh()
    assert.equal(f.coupon.uses, 0)
    const variant = await ProductVariant.findOrFail(f.variants[0].id)
    assert.equal(variant.stock, 5)
  })
  test('repeated payment events settle once; mismatch, unauthorized settlement and paid cancellation are rejected', async ({
    assert,
  }) => {
    const f = await setup()
    const order = await new PlaceOrder().execute(
      f.state,
      f.input,
      f.customer.id,
      'en',
      f.state,
      new CheckoutModules(f.ctx, f.selections)
    )
    const payment = await Payment.query().where('orderId', order.id).firstOrFail()
    const action = new SettlePayment()
    const event = { reference: 'fake-event', amountMinor: 1100, currency: 'USD' }
    const actor = { customerId: f.customer.id, administrator: false }
    await assert.rejects(() =>
      action.execute(payment.publicId, { ...event, amountMinor: 1 }, actor, 'en')
    )
    await assert.rejects(() =>
      action.execute(
        payment.publicId,
        event,
        { customerId: f.customer.id + 1, administrator: false },
        'en'
      )
    )
    await action.execute(payment.publicId, event, actor, 'en')
    await action.execute(payment.publicId, event, actor, 'en')
    await order.refresh()
    assert.equal(order.paymentStatus, 'paid')
    assert.equal(order.status, 'pending')
    await assert.rejects(() =>
      new CancelOrder().execute(order.publicId, { id: f.customer.id, admin: false }, 'en')
    )
  })
  test('cancelled orders cannot accept payment and disabling modules preserves historical receipts', async ({
    assert,
    client,
  }) => {
    const f = await setup()
    const order = await new PlaceOrder().execute(
      f.state,
      f.input,
      f.customer.id,
      'en',
      f.state,
      new CheckoutModules(f.ctx, f.selections)
    )
    const payment = await Payment.query().where('orderId', order.id).firstOrFail()
    await new CancelOrder().execute(order.publicId, { id: f.customer.id, admin: false }, 'en')
    await assert.rejects(() =>
      new SettlePayment().execute(
        payment.publicId,
        { reference: 'cancelled-payment', amountMinor: 1100, currency: 'USD' },
        { customerId: f.customer.id, administrator: false },
        'en'
      )
    )
    await f.store
      .merge({ couponsEnabled: false, shippingEnabled: false, fakePaymentEnabled: false })
      .save()
    const receipt = await client.get('/orders/' + order.publicId).loginAs(f.customer)
    receipt.assertStatus(200)
    assert.include(receipt.text(), 'Local zone')
  }).timeout(60_000)
  test('staff cannot change module configuration; coupon usage cannot be overwritten by HTTP input', async ({
    client,
    assert,
  }) => {
    const f = await setup()
    const staff = await User.create({
      fullName: 'Staff',
      email: 'module-staff@example.test',
      password: 'test-password-123456',
      role: 'staff',
    })
    const denied = await client
      .post('/admin/module-configuration/coupons')
      .loginAs(staff)
      .withCsrfToken()
      .header('Accept', 'application/json')
      .json({})
    denied.assertStatus(403)
    const owner = await User.create({
      fullName: 'Owner',
      email: 'module-owner@example.test',
      password: 'test-password-123456',
      role: 'owner',
    })
    const response = await client
      .post('/admin/module-configuration/coupons')
      .loginAs(owner)
      .withCsrfToken()
      .redirects(0)
      .json({
        id: f.coupon.id,
        code: 'TEN',
        kind: 'percentage',
        currency: 'USD',
        value: 1000,
        minimumMinor: 0,
        usageLimit: 10,
        isActive: true,
        uses: 9,
      })
    response.assertStatus(302)
    await f.coupon.refresh()
    assert.equal(f.coupon.uses, 0)
  })
})
