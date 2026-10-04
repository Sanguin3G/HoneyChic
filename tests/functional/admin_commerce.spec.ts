import { test } from '@japa/runner'
import { randomUUID } from 'node:crypto'
import testUtils from '@adonisjs/core/services/test_utils'
import User from '#domains/customers/models/user'
import StoreSetting from '#core/store/store_setting'
import Order from '#domains/orders/models/order'
import PlaceOrder from '#domains/orders/actions/place_order'
import CustomerAddress from '#domains/customers/models/customer_address'
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
  })
})
