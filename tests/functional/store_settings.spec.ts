import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import User from '#domains/customers/models/user'
import StoreSetting from '#core/store/store_setting'

const settings = {
  name: 'Minh Anh Electronics',
  description: 'Merchant-written description',
  email: 'shop@example.test',
  phone: null,
  address: '',
  currency: 'VND',
  defaultLocale: 'vi',
  timezone: 'Asia/Ho_Chi_Minh',
  orderPrefix: 'MA',
  lowStockThreshold: 3,
  customerAccountsEnabled: true,
  registrationEnabled: false,
}

function pageData(html: string) {
  const data = html.match(/<script[^>]*data-page="[^"]*"[^>]*>([\s\S]*?)<\/script>/)?.[1]
  if (!data) throw new Error('Missing Inertia page data')
  return JSON.parse(data)
}
async function user(role: 'owner' | 'staff' | 'customer') {
  return User.create({
    fullName: role,
    email: role + '@example.test',
    password: 'test-password-123456',
    role,
  })
}

test.group('Store configuration and authorization', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('only owner may read or update settings; staff may enter admin', async ({
    client,
    assert,
  }) => {
    for (const role of ['customer', 'staff'] as const) {
      const actor = await user(role)
      const read = await client
        .get('/admin/settings')
        .loginAs(actor)
        .header('Accept', 'application/json')
      read.assertStatus(403)
      const html = await client
        .get('/admin/settings')
        .loginAs(actor)
        .header('Accept', 'text/html')
        .header('Accept-Language', 'vi')
      html.assertStatus(403)
      assert.include(html.text(), 'Không có quyền truy cập')
      const write = await client
        .put('/admin/settings')
        .loginAs(actor)
        .withCsrfToken()
        .header('Accept', 'application/json')
        .json(settings)
      write.assertStatus(403)
      const overview = await client
        .get('/admin')
        .loginAs(actor)
        .header('Accept', 'application/json')
      overview.assertStatus(role === 'staff' ? 200 : 403)
    }
    const saved = await StoreSetting.findOrFail(1)
    assert.notEqual(saved.name, settings.name)
  })

  test('owner settings persist and are shared with the storefront; uninstalled modules stay unavailable', async ({
    client,
    assert,
  }) => {
    const owner = await user('owner')
    const response = await client
      .put('/admin/settings')
      .loginAs(owner)
      .withCsrfToken()
      .redirects(0)
      .json({ ...settings, 'customerAccountsEnabled': false, 'payments.stripe': true })
    response.assertStatus(302)
    response.assertHeader('location', '/admin/settings')
    response.assertFlashMissing('errors')
    const saved = await StoreSetting.findOrFail(1)
    assert.equal(saved.currency, 'VND')
    assert.equal(saved.timezone, settings.timezone)
    const home = await client.get('/')
    const page = pageData(home.text())
    assert.equal(page.props.store.name, settings.name)
    assert.equal(page.props.locale, 'vi')
    assert.deepEqual(page.props.capabilities.customer_accounts, {
      installed: true,
      enabled: false,
      configured: true,
      available: false,
    })
    assert.deepEqual(page.props.capabilities['payments.stripe'], {
      installed: false,
      enabled: false,
      configured: false,
      available: false,
    })
    assert.notProperty(page.props.store, 'email')
    assert.notProperty(page.props.store, 'registrationEnabled')
  })

  test('invalid regional settings cannot overwrite saved settings', async ({ client, assert }) => {
    const owner = await user('owner')
    const initial = await StoreSetting.findOrFail(1)
    const before = initial.currency
    const response = await client
      .put('/admin/settings')
      .loginAs(owner)
      .withCsrfToken()
      .header('Accept', 'application/json')
      .header('Accept-Language', 'vi')
      .json({ ...settings, currency: 'ZZZ', timezone: 'Moon/Sea', lowStockThreshold: -1 })
    response.assertStatus(422)
    assert.include(response.text(), 'Nhập mã tiền tệ được hỗ trợ.')
    assert.include(response.text(), 'Nhập múi giờ hợp lệ.')
    const saved = await StoreSetting.findOrFail(1)
    assert.equal(saved.currency, before)
  })

  test('locale selection persists on the user and has the documented precedence', async ({
    client,
    assert,
  }) => {
    const customer = await user('customer')
    await customer.merge({ preferredLocale: 'vi' }).save()
    const preferred = await client.get('/account').loginAs(customer).header('Accept-Language', 'en')
    assert.equal(pageData(preferred.text()).props.locale, 'vi')
    const explicit = await client
      .get('/account')
      .loginAs(customer)
      .withSession({ locale: 'en' })
      .header('Accept-Language', 'vi')
    assert.equal(pageData(explicit.text()).props.locale, 'en')
    const selected = await client
      .post('/locale')
      .loginAs(customer)
      .withCsrfToken()
      .redirects(0)
      .json({ locale: 'en', destination: 'account', preferredLocale: 'vi' })
    selected.assertStatus(302)
    selected.assertHeader('location', '/account')
    await customer.refresh()
    assert.equal(customer.preferredLocale, 'en')
    const freshSession = await client
      .get('/account')
      .loginAs(customer)
      .header('Accept-Language', 'vi')
    assert.equal(pageData(freshSession.text()).props.locale, 'en')
  })
})
