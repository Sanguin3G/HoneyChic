import { test } from '@japa/runner'
import { randomUUID } from 'node:crypto'
import testUtils from '@adonisjs/core/services/test_utils'
import User from '#domains/customers/models/user'
import StoreSetting from '#core/store/store_setting'
import Order from '#domains/orders/models/order'
import PlaceOrder from '#domains/orders/actions/place_order'
import CustomerAddress from '#domains/customers/models/customer_address'
import ProductVariant from '#domains/catalog/models/product_variant'
import AdjustInventory from '#domains/inventory/actions/adjust_inventory'
import { cartFixture, inertiaPage } from '../support/cart_fixture.js'
async function customer(email: string, role: 'customer' | 'staff' | 'owner' = 'customer') {
  return User.create({ fullName: 'Account ' + role, email, password: 'test-password-123456', role })
}
async function orderFor(customerId: number | null) {
  const { variants } = await cartFixture()
  return new PlaceOrder().execute(
    { currency: 'USD', lines: [[variants[0].id, 1, 1000]] },
    {
      token: randomUUID(),
      customerName: 'Original customer',
      customerEmail: 'snapshot@example.test',
      customerPhone: '123',
      deliveryAddress: 'Original address',
      note: '',
      expectedTotalMinor: 1000,
    },
    customerId,
    'en'
  )
}
test.group('Commerce administration and account boundaries', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())
  test('customer order history is scoped and another account cannot view or cancel the order', async ({
    client,
    assert,
  }) => {
    const owner = await customer('order-owner@example.test')
    const other = await customer('order-other@example.test')
    const order = await orderFor(owner.id)
    const list = await client.get('/account/orders').loginAs(owner).header('Accept', 'text/html')
    list.assertStatus(200)
    assert.lengthOf(inertiaPage(list.text()).props.orders, 1)
    const otherList = await client
      .get('/account/orders')
      .loginAs(other)
      .header('Accept', 'text/html')
    assert.lengthOf(inertiaPage(otherList.text()).props.orders, 0)
    for (const operation of ['get', 'post'] as const) {
      const url = '/orders/' + order.publicId + (operation === 'post' ? '/cancel' : '')
      const response = await client[operation](url)
        .loginAs(other)
        .withCsrfToken()
        .header('Accept', 'application/json')
      response.assertStatus(404)
    }
    const record0 = await Order.findOrFail(order.id)
    assert.equal(record0.status, 'pending')
  })
  test('staff may advance fulfillment but customers cannot; invalid jumps cannot mark payment paid', async ({
    client,
    assert,
  }) => {
    const staff = await customer('staff@example.test', 'staff')
    const buyer = await customer('buyer@example.test')
    const order = await orderFor(buyer.id)
    const url = '/admin/orders/' + order.publicId
    const denied = await client
      .patch(url)
      .loginAs(buyer)
      .withCsrfToken()
      .json({ status: 'completed' })
    denied.assertStatus(403)
    const jump = await client
      .patch(url)
      .loginAs(staff)
      .withCsrfToken()
      .header('Accept', 'application/json')
      .json({ status: 'completed' })
    jump.assertStatus(422)
    for (const status of ['processing', 'completed']) {
      const changed = await client
        .patch(url)
        .loginAs(staff)
        .withCsrfToken()
        .redirects(0)
        .json({ status, paymentStatus: 'paid' })
      changed.assertStatus(302)
    }
    await order.refresh()
    assert.equal(order.status, 'completed')
    assert.equal(order.paymentStatus, 'unpaid')
    const cancelled = await client
      .patch(url)
      .loginAs(staff)
      .withCsrfToken()
      .header('Accept', 'application/json')
      .json({ status: 'cancelled' })
    cancelled.assertStatus(422)
  })
  test('customer administration ignores privileged fields and preserves historical snapshots', async ({
    client,
    assert,
  }) => {
    const staff = await customer('staff-customer@example.test', 'staff')
    const buyer = await customer('edit-customer@example.test')
    const order = await orderFor(buyer.id)
    const changed = await client
      .patch('/admin/customers/' + buyer.id)
      .loginAs(staff)
      .withCsrfToken()
      .redirects(0)
      .json({
        fullName: 'Corrected name',
        role: 'owner',
        email: 'changed@example.test',
        password: 'changed-password',
      })
    changed.assertStatus(302)
    await buyer.refresh()
    await order.refresh()
    assert.equal(buyer.fullName, 'Corrected name')
    assert.equal(buyer.role, 'customer')
    assert.equal(buyer.email, 'edit-customer@example.test')
    assert.equal(order.customerName, 'Original customer')
    const privileged = await client
      .patch('/admin/customers/' + staff.id)
      .loginAs(staff)
      .withCsrfToken()
      .json({ fullName: 'Unexpected' })
    privileged.assertStatus(404)
    const denied = await client.get('/admin/customers').loginAs(buyer)
    denied.assertStatus(403)
  })
  test('only owners configure capabilities and disabling checkout does not lock out admin', async ({
    client,
    assert,
  }) => {
    const staff = await customer('module-staff@example.test', 'staff')
    const owner = await customer('module-owner@example.test', 'owner')
    const input = {
      guestCheckoutEnabled: false,
      customerAccountsEnabled: false,
      registrationEnabled: false,
      reviews: true,
    }
    const denied = await client.put('/admin/modules').loginAs(staff).withCsrfToken().json(input)
    denied.assertStatus(403)
    const changed = await client
      .put('/admin/modules')
      .loginAs(owner)
      .withCsrfToken()
      .redirects(0)
      .json(input)
    changed.assertStatus(302)
    const record1 = await StoreSetting.findOrFail(1)
    assert.isFalse(record1.guestCheckoutEnabled)
    const admin = await client.get('/admin/modules').loginAs(owner).header('Accept', 'text/html')
    admin.assertStatus(200)
    const caps = inertiaPage(admin.text()).props.capabilities
    assert.isTrue(caps.guest_checkout.installed)
    assert.isFalse(caps.guest_checkout.available)
    assert.isTrue(caps.reviews.installed)
    assert.isFalse(caps.reviews.available)
    const { variants } = await cartFixture()
    const token = randomUUID()
    const blocked = await client
      .post('/checkout')
      .withCsrfToken()
      .withSession({
        checkoutToken: token,
        cart: { currency: 'USD', lines: [[variants[0].id, 1, 1000]] },
      })
      .header('Accept', 'application/json')
      .json({
        token,
        customerName: 'Guest',
        customerEmail: 'guest@example.test',
        customerPhone: '123',
        deliveryAddress: 'Example',
        expectedTotalMinor: 1000,
      })
    blocked.assertStatus(422)
    assert.lengthOf(await Order.all(), 0)
  })
  test('store profiles apply owner presets and leave custom flags unchanged', async ({
    client,
    assert,
  }) => {
    const staff = await customer('profile-staff@example.test', 'staff')
    const owner = await customer('profile-owner@example.test', 'owner')
    const buyer = await customer('profile-buyer@example.test')
    const denied = await client
      .post('/admin/modules/profile')
      .loginAs(staff)
      .withCsrfToken()
      .json({ storeProfile: 'catalog_only' })
    denied.assertStatus(403)
    const store = await StoreSetting.findOrFail(1)
    await store
      .merge({
        guestCheckoutEnabled: true,
        customerAccountsEnabled: true,
        registrationEnabled: true,
        reviewsEnabled: false,
        wishlistEnabled: true,
        couponsEnabled: false,
        shippingEnabled: false,
        codEnabled: false,
        fakePaymentEnabled: true,
        storeProfile: 'custom',
      })
      .save()
    const custom = await client
      .post('/admin/modules/profile')
      .loginAs(owner)
      .withCsrfToken()
      .redirects(0)
      .json({ storeProfile: 'custom' })
    custom.assertStatus(302)
    await store.refresh()
    assert.isTrue(store.wishlistEnabled)
    assert.isTrue(store.fakePaymentEnabled)
    assert.equal(store.storeProfile, 'custom')
    const presets = {
      simple_seller: {
        guestCheckoutEnabled: true,
        customerAccountsEnabled: true,
        registrationEnabled: true,
        reviewsEnabled: false,
        wishlistEnabled: false,
        couponsEnabled: false,
        shippingEnabled: false,
        codEnabled: false,
        fakePaymentEnabled: false,
      },
      standard_store: {
        guestCheckoutEnabled: true,
        customerAccountsEnabled: true,
        registrationEnabled: true,
        reviewsEnabled: true,
        wishlistEnabled: true,
        couponsEnabled: true,
        shippingEnabled: true,
        codEnabled: false,
        fakePaymentEnabled: false,
      },
      catalog_only: {
        guestCheckoutEnabled: false,
        customerAccountsEnabled: false,
        registrationEnabled: false,
        reviewsEnabled: false,
        wishlistEnabled: false,
        couponsEnabled: false,
        shippingEnabled: false,
        codEnabled: false,
        fakePaymentEnabled: false,
      },
    }
    for (const name of Object.keys(presets) as (keyof typeof presets)[]) {
      const saved = await client
        .post('/admin/modules/profile')
        .loginAs(owner)
        .withCsrfToken()
        .redirects(0)
        .json({ storeProfile: name })
      saved.assertStatus(302)
      await store.refresh()
      assert.equal(store.storeProfile, name)
      for (const [flag, value] of Object.entries(presets[name])) {
        assert.equal(store[flag as keyof typeof store], value)
      }
    }
    const { variants } = await cartFixture()
    const token = randomUUID()
    const blockedCheckout = await client
      .post('/checkout')
      .withCsrfToken()
      .withSession({
        checkoutToken: token,
        cart: { currency: 'USD', lines: [[variants[0].id, 1, 1000]] },
      })
      .header('Accept', 'application/json')
      .json({
        token,
        customerName: 'Guest',
        customerEmail: 'guest-profile@example.test',
        customerPhone: '123',
        deliveryAddress: 'Example',
        expectedTotalMinor: 1000,
      })
    blockedCheckout.assertStatus(422)
    assert.include(JSON.stringify(blockedCheckout.body()), 'checkoutDisabled')
    const accountToken = randomUUID()
    const accountBlocked = await client
      .post('/checkout')
      .loginAs(buyer)
      .withCsrfToken()
      .withSession({
        checkoutToken: accountToken,
        cart: { currency: 'USD', lines: [[variants[0].id, 1, 1000]] },
      })
      .header('Accept', 'application/json')
      .json({
        token: accountToken,
        customerName: 'Buyer',
        customerEmail: 'profile-buyer@example.test',
        customerPhone: '123',
        deliveryAddress: 'Example',
        expectedTotalMinor: 1000,
      })
    accountBlocked.assertStatus(422)
    assert.include(JSON.stringify(accountBlocked.body()), 'checkoutDisabled')
    const invalid = await client
      .post('/admin/modules/profile')
      .loginAs(owner)
      .withCsrfToken()
      .header('Accept', 'application/json')
      .json({ storeProfile: 'stripe' })
    invalid.assertStatus(422)
    const manual = await client
      .put('/admin/modules')
      .loginAs(owner)
      .withCsrfToken()
      .redirects(0)
      .json({
        guestCheckoutEnabled: true,
        customerAccountsEnabled: true,
        registrationEnabled: true,
        reviewsEnabled: false,
        wishlistEnabled: false,
        couponsEnabled: false,
        shippingEnabled: false,
        codEnabled: false,
        fakePaymentEnabled: false,
      })
    manual.assertStatus(302)
    await store.refresh()
    assert.equal(store.storeProfile, 'custom')
    assert.isTrue(store.guestCheckoutEnabled)
    assert.isFalse(store.reviewsEnabled)
  })
  test('saved addresses are scoped to the customer and checkout takes an independent copy', async ({
    client,
    assert,
  }) => {
    const buyer = await customer('address-buyer@example.test')
    const other = await customer('address-other@example.test')
    const input = {
      label: 'Home',
      recipient: 'Recipient',
      phone: '123',
      address: 'Original saved address',
    }
    const created = await client
      .post('/account/addresses')
      .loginAs(buyer)
      .withCsrfToken()
      .redirects(0)
      .json({ ...input, customerId: other.id })
    created.assertStatus(302)
    const row = await CustomerAddress.query().where('customerId', buyer.id).firstOrFail()
    const invalid = await client
      .put('/account/addresses/0')
      .loginAs(buyer)
      .withCsrfToken()
      .header('Accept', 'application/json')
      .json(input)
    invalid.assertStatus(422)
    assert.lengthOf(await CustomerAddress.query().where('customerId', buyer.id), 1)
    const denied = await client
      .put('/account/addresses/' + row.id)
      .loginAs(other)
      .withCsrfToken()
      .json({ ...input, address: 'Unauthorized' })
    denied.assertStatus(404)
    const { variants } = await cartFixture()
    const order = await new PlaceOrder().execute(
      { currency: 'USD', lines: [[variants[0].id, 1, 1000]] },
      {
        token: randomUUID(),
        customerName: row.recipient,
        customerEmail: buyer.email,
        customerPhone: row.phone,
        deliveryAddress: row.address,
        note: '',
        expectedTotalMinor: 1000,
      },
      buyer.id,
      'en'
    )
    await row.merge({ address: 'Changed later' }).save()
    await order.refresh()
    assert.equal(order.deliveryAddress, 'Original saved address')
  })
  test('dashboard separates currencies and does not count cancelled order value', async ({
    client,
    assert,
  }) => {
    const staff = await customer('dashboard-staff@example.test', 'staff')
    const order = await orderFor(null)
    const page = await client.get('/admin').loginAs(staff).header('Accept', 'text/html')
    page.assertStatus(200)
    const dashboard = inertiaPage(page.text()).props.dashboard
    assert.equal(dashboard.counts.orders, 1)
    assert.deepEqual(dashboard.totals, [{ currency: 'USD', count: 1, amountMinor: '1000' }])
    await order.merge({ status: 'cancelled' }).save()
    const refreshed = await client.get('/admin').loginAs(staff).header('Accept', 'text/html')
    assert.lengthOf(inertiaPage(refreshed.text()).props.dashboard.totals, 0)
    const variants = await ProductVariant.query().orderBy('stock', 'desc')
    await new AdjustInventory().execute(
      {
        variantId: variants[0].id,
        quantityDelta: -variants[0].stock,
        reason: 'sale',
        actorId: null,
      },
      'en'
    )
    const counted = await client.get('/admin').loginAs(staff).header('Accept', 'text/html')
    assert.equal(inertiaPage(counted.text()).props.dashboard.counts.low_stock, 1)
    const low = await client
      .get('/admin/inventory?state=low')
      .loginAs(staff)
      .header('Accept', 'text/html')
    const out = await client
      .get('/admin/inventory?state=out')
      .loginAs(staff)
      .header('Accept', 'text/html')
    assert.lengthOf(inertiaPage(low.text()).props.variants, 1)
    assert.lengthOf(inertiaPage(out.text()).props.variants, 1)
  })
})

test.group('Store profile pages', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())
  test('catalog only keeps administrators signed in and the existing order readable', async ({
    client,
    assert,
  }) => {
    const staff = await customer('profile-page-staff@example.test', 'staff')
    const owner = await customer('profile-page-owner@example.test', 'owner')
    const buyer = await customer('profile-page-buyer@example.test')
    const order = await orderFor(buyer.id)
    const catalog = await client
      .post('/admin/modules/profile')
      .loginAs(owner)
      .withCsrfToken()
      .redirects(0)
      .json({ storeProfile: 'catalog_only' })
    catalog.assertStatus(302)
    const admin = await client.get('/admin/modules').loginAs(owner).header('Accept', 'text/html')
    admin.assertStatus(200)
    assert.equal(inertiaPage(admin.text()).props.settings.storeProfile, 'catalog_only')
    const staffPage = await client
      .get('/admin/modules')
      .loginAs(staff)
      .header('Accept', 'text/html')
    staffPage.assertStatus(200)
    const readable = await client
      .get('/admin/orders/' + order.publicId)
      .loginAs(owner)
      .header('Accept', 'text/html')
    readable.assertStatus(200)
    assert.equal(inertiaPage(readable.text()).props.order.publicId, order.publicId)
  })
})

test.group('Setup wizard', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())
  test('the wizard applies a profile and shop record without rewriting an order', async ({
    client,
    assert,
  }) => {
    const staff = await customer('wizard-staff@example.test', 'staff')
    const owner = await customer('wizard-owner@example.test', 'owner')
    const order = await orderFor(owner.id)
    const number = order.number
    const denied = await client
      .get('/admin/setup')
      .loginAs(staff)
      .header('Accept', 'application/json')
    denied.assertStatus(403)
    const deniedSave = await client
      .post('/admin/setup')
      .loginAs(staff)
      .withCsrfToken()
      .header('Accept', 'application/json')
      .json({
        storeProfile: 'simple_seller',
        name: 'Nope',
        currency: 'USD',
        defaultLocale: 'en',
        timezone: 'UTC',
        orderPrefix: 'NO',
      })
    deniedSave.assertStatus(403)
    const invalid = await client
      .post('/admin/setup')
      .loginAs(owner)
      .withCsrfToken()
      .header('Accept', 'application/json')
      .json({
        storeProfile: 'simple_seller',
        name: 'Wizard Shop',
        currency: 'XXX',
        defaultLocale: 'en',
        timezone: 'UTC',
        orderPrefix: 'WZ',
      })
    invalid.assertStatus(422)
    const store = await StoreSetting.findOrFail(1)
    assert.notEqual(store.name, 'Wizard Shop')
    const saved = await client
      .post('/admin/setup')
      .loginAs(owner)
      .withCsrfToken()
      .redirects(0)
      .json({
        storeProfile: 'simple_seller',
        name: 'Wizard Shop',
        currency: 'EUR',
        defaultLocale: 'vi',
        timezone: 'UTC',
        orderPrefix: 'WZ',
      })
    saved.assertStatus(302)
    await store.refresh()
    assert.equal(store.storeProfile, 'simple_seller')
    assert.equal(store.name, 'Wizard Shop')
    assert.equal(store.currency, 'EUR')
    assert.equal(store.defaultLocale, 'vi')
    assert.equal(store.timezone, 'UTC')
    assert.equal(store.orderPrefix, 'WZ')
    assert.isTrue(store.guestCheckoutEnabled)
    assert.isTrue(store.customerAccountsEnabled)
    assert.isTrue(store.registrationEnabled)
    assert.isFalse(store.reviewsEnabled)
    assert.isFalse(store.wishlistEnabled)
    assert.isFalse(store.couponsEnabled)
    assert.isFalse(store.shippingEnabled)
    assert.isFalse(store.codEnabled)
    assert.isFalse(store.fakePaymentEnabled)
    await order.refresh()
    assert.equal(order.currency, 'USD')
    assert.equal(order.number, number)
    assert.equal(order.customerName, 'Original customer')
    await store.merge({ wishlistEnabled: true, fakePaymentEnabled: true }).save()
    const custom = await client
      .post('/admin/setup')
      .loginAs(owner)
      .withCsrfToken()
      .redirects(0)
      .json({
        storeProfile: 'custom',
        name: 'Custom Shop',
        currency: 'EUR',
        defaultLocale: 'vi',
        timezone: 'UTC',
        orderPrefix: 'WZ',
      })
    custom.assertStatus(302)
    await store.refresh()
    assert.equal(store.storeProfile, 'custom')
    assert.equal(store.name, 'Custom Shop')
    assert.isTrue(store.wishlistEnabled)
    assert.isTrue(store.fakePaymentEnabled)
    const page = await client.get('/admin/setup').loginAs(owner).header('Accept', 'text/html')
    page.assertStatus(200)
    assert.equal(inertiaPage(page.text()).component, 'admin/setup')
    assert.equal(inertiaPage(page.text()).props.setup.name, 'Custom Shop')
  })
})
