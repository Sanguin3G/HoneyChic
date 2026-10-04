import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import PlaceOrder from '#domains/orders/actions/place_order'
import ChangeOrderStatus from '#domains/orders/actions/change_order_status'
import ProductVariant from '#domains/catalog/models/product_variant'
import Payment from '#modules/payments/models/payment'
import SettlePayment from '#modules/payments/actions/settle_payment'
import CheckoutModules from '../../app/http/actions/checkout_modules.js'
import { moduleFixture } from '../support/module_fixture.js'
import { inertiaPage } from '../support/cart_fixture.js'
test.group('Optional checkout review and COD authorization', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())
  test('disabled checkout modules clear stale selections only on review and preserve authoritative totals', async ({
    assert,
    client,
  }) => {
    const f = await moduleFixture()
    const charges = await new CheckoutModules(f.ctx, f.selections).quote(1000, 'USD')
    const session = {
      cart: f.state,
      checkoutReview: f.state,
      checkoutToken: f.input.token,
      checkoutSelections: f.selections,
      checkoutChargeReview: charges,
    }
    await f.store
      .merge({
        shippingEnabled: false,
        couponsEnabled: false,
        codEnabled: false,
        fakePaymentEnabled: false,
      })
      .save()
    const stale = await client
      .post('/checkout')
      .withCsrfToken()
      .withSession(session)
      .header('Accept', 'application/json')
      .json(f.input)
    stale.assertStatus(422)
    const reviewed = await client.get('/checkout').withSession(session)
    reviewed.assertStatus(200)
    const props = inertiaPage(reviewed.text()).props
    assert.equal(props.pricing.totalMinor, 1000)
    assert.equal(props.pricing.shippingMinor, 0)
    assert.equal(props.pricing.discountMinor, 0)
    assert.equal(props.selections.couponCode, '')
    assert.isUndefined(props.selections.shippingRateId)
    assert.isUndefined(props.selections.paymentMethod)
    const options = await client
      .post('/checkout/options')
      .withCsrfToken()
      .withSession(reviewed.session())
      .redirects(0)
      .json(f.selections)
    options.assertStatus(302)
    const placed = await client
      .post('/checkout')
      .withCsrfToken()
      .withSession(reviewed.session())
      .redirects(0)
      .json({ ...f.input, expectedTotalMinor: 1000 })
    placed.assertStatus(302)
    await f.coupon.refresh()
    assert.equal(f.coupon.uses, 0)
    assert.lengthOf(await Payment.all(), 0)
    const variant = await ProductVariant.findOrFail(f.variants[0].id)
    assert.equal(variant.stock, 4)
  })
  test('changed shipping and coupon amounts require review even when the final total is unchanged', async ({
    assert,
  }) => {
    const f = await moduleFixture()
    const charges = await new CheckoutModules(f.ctx, f.selections).quote(1000, 'USD')
    await f.rate.merge({ amountMinor: 300 }).save()
    await f.coupon.merge({ value: 2000 }).save()
    await assert.rejects(() =>
      new PlaceOrder().execute(
        f.state,
        f.input,
        f.customer.id,
        'en',
        f.state,
        new CheckoutModules(f.ctx, f.selections, charges)
      )
    )
    const variant = await ProductVariant.findOrFail(f.variants[0].id)
    assert.equal(variant.stock, 5)
    await f.coupon.refresh()
    assert.equal(f.coupon.uses, 0)
  })
  test('COD requires an administrator and processing has begun; recording cash never completes fulfillment', async ({
    assert,
  }) => {
    const f = await moduleFixture()
    const order = await new PlaceOrder().execute(
      f.state,
      f.input,
      f.customer.id,
      'en',
      f.state,
      new CheckoutModules(f.ctx, { ...f.selections, paymentMethod: 'cod' })
    )
    const payment = await Payment.query().where('orderId', order.id).firstOrFail()
    const action = new SettlePayment()
    const event = { reference: 'collected-cash', amountMinor: 1100, currency: 'USD' }
    await assert.rejects(() =>
      action.execute(
        payment.publicId,
        event,
        { customerId: f.customer.id, administrator: true },
        'en'
      )
    )
    await new ChangeOrderStatus().execute(order.publicId, 'processing', f.customer.id, 'en')
    await assert.rejects(() =>
      action.execute(
        payment.publicId,
        event,
        { customerId: f.customer.id, administrator: false },
        'en'
      )
    )
    await action.execute(
      payment.publicId,
      event,
      { customerId: f.customer.id, administrator: true },
      'en'
    )
    await action.execute(
      payment.publicId,
      event,
      { customerId: f.customer.id, administrator: true },
      'en'
    )
    await order.refresh()
    assert.equal(order.status, 'processing')
    assert.equal(order.paymentStatus, 'paid')
  })
})
