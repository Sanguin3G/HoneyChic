import { test } from '@japa/runner'
import { randomUUID } from 'node:crypto'
import testUtils from '@adonisjs/core/services/test_utils'
import User from '#domains/customers/models/user'
import Order from '#domains/orders/models/order'
import PlaceOrder from '#domains/orders/actions/place_order'
import { cartFixture, inertiaPage } from '../support/cart_fixture.js'

async function placed(name: string, slug = 'cart-keyboard') {
  const { variants } = await cartFixture(slug)
  return new PlaceOrder().execute(
    { currency: 'USD', lines: [[variants[0].id, 1, 1000]] },
    {
      token: randomUUID(),
      customerName: name,
      customerEmail: 'snapshot@example.test',
      customerPhone: '123',
      deliveryAddress: 'Original address',
      note: '',
      expectedTotalMinor: 1000,
    },
    null,
    'en'
  )
}

test.group('Order report', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('staff can download the filtered order snapshot and a customer cannot', async ({
    client,
    assert,
  }) => {
    const staff = await User.create({
      fullName: 'Staff',
      email: 'export-staff@example.test',
      password: 'test-password-123456',
      role: 'staff',
    })
    const customer = await User.create({
      fullName: 'Customer',
      email: 'export-customer@example.test',
      password: 'test-password-123456',
      role: 'customer',
    })
    const kept = await placed('=cmd', 'export-kept')
    const dropped = await placed('Hidden customer', 'export-dropped')
    dropped.status = 'cancelled'
    await dropped.save()
    const denied = await client.get('/admin/orders/export').loginAs(customer).redirects(0)
    denied.assertStatus(403)
    await kept.refresh()
    assert.equal(kept.status, 'pending')
    assert.equal(kept.totalMinor, 1000)
    const filtered = await client
      .get('/admin/orders/export?status=pending')
      .loginAs(staff)
      .header('Accept', 'text/csv')
    filtered.assertStatus(200)
    filtered.assertHeader('content-type', 'text/csv; charset=utf-8')
    filtered.assertHeader('content-disposition', 'attachment; filename="orders.csv"')
    const csv = filtered.text()
    assert.include(csv, kept.number)
    assert.include(csv, "'=cmd")
    assert.include(csv, '10.00')
    assert.notInclude(csv, dropped.number)
    await kept.refresh()
    assert.equal(kept.customerName, '=cmd')
    assert.equal(kept.totalMinor, 1000)
  })

  test('overview average and top products use non-cancelled order snapshots', async ({
    client,
    assert,
  }) => {
    const owner = await User.create({
      fullName: 'Owner',
      email: 'report-owner@example.test',
      password: 'test-password-123456',
      role: 'owner',
    })
    const order = await placed('Report customer')
    const page = await client.get('/admin').loginAs(owner).header('Accept', 'text/html')
    page.assertStatus(200)
    const dashboard = inertiaPage(page.text()).props.dashboard
    assert.equal(dashboard.totals[0].currency, 'USD')
    assert.equal(dashboard.totals[0].amountMinor, '1000')
    assert.equal(dashboard.totals[0].averageMinor, '1000')
    assert.equal(dashboard.topProducts[0].name, 'cart-keyboard')
    assert.equal(dashboard.topProducts[0].quantity, 1)
    assert.equal(dashboard.topProducts[0].amountMinor, '1000')
    const saved = await Order.findOrFail(order.id)
    assert.equal(saved.totalMinor, 1000)
    assert.equal(saved.status, 'pending')
  })
})
