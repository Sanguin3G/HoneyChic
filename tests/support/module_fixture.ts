import { randomUUID } from 'node:crypto'
import type { HttpContext } from '@adonisjs/core/http'
import StoreSetting from '#core/store/store_setting'
import User from '#domains/customers/models/user'
import ShippingRate from '#modules/shipping/models/shipping_rate'
import Coupon from '#modules/coupons/models/coupon'
import { cartFixture } from './cart_fixture.js'
export async function moduleFixture() {
  const store = await StoreSetting.findOrFail(1)
  await store
    .merge({
      reviewsEnabled: true,
      wishlistEnabled: true,
      shippingEnabled: true,
      couponsEnabled: true,
      codEnabled: true,
      fakePaymentEnabled: true,
    })
    .save()
  const customer = await User.create({
    fullName: 'Module customer',
    email: 'modules@example.test',
    password: 'test-password-123456',
    role: 'customer',
  })
  const fixture = await cartFixture()
  const state = {
    currency: 'USD',
    lines: [[fixture.variants[0].id, 1, 1000]] as [number, number, number][],
  }
  const rate = await ShippingRate.create({
    name: 'Local zone',
    kind: 'flat',
    currency: 'USD',
    amountMinor: 200,
    freeAboveMinor: 2000,
    countries: ['VN'],
    isActive: true,
  })
  const coupon = await Coupon.create({
    code: 'TEN',
    kind: 'percentage',
    currency: 'USD',
    value: 1000,
    minimumMinor: 1000,
    usageLimit: 1,
    uses: 0,
    isActive: true,
  })
  const ctx = { store, locale: 'en' } as HttpContext
  const selections = {
    shippingRateId: rate.id,
    country: 'VN',
    couponCode: 'TEN',
    paymentMethod: 'fake' as const,
  }
  const input = {
    token: randomUUID(),
    customerName: 'Checkout name',
    customerEmail: customer.email,
    customerPhone: '123456',
    deliveryAddress: 'Example street',
    expectedTotalMinor: 1100,
  }
  return { ...fixture, store, customer, state, rate, coupon, ctx, selections, input }
}
