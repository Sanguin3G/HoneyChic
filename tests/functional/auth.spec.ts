import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import CreateInitialOwner from '#domains/customers/actions/create_initial_owner'
import User from '#domains/customers/models/user'
import StoreSetting from '#core/store/store_setting'
import limiter from '@adonisjs/limiter/services/main'

const password = 'test-password-123456'
const customerDetails = { fullName: 'Demo Customer', email: 'customer@example.test', password }
const customerInput = {
  fullName: 'Demo Customer',
  email: 'customer@example.test',
  password,
  password_confirmation: password,
}

test.group('Account access', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())
  group.each.setup(async () => {
    await limiter.clear(['memory'])
  })

  test('initial owner bootstrap cannot create or replace a second owner', async ({ assert }) => {
    const action = new CreateInitialOwner()
    const owner = await action.execute({ ...customerInput, email: 'owner@example.test' })
    assert.exists(owner)
    assert.equal(owner!.role, 'owner')
    const second = await action.execute({ ...customerInput, email: 'second-owner@example.test' })
    assert.isNull(second)
    const owners = await User.query().where('role', 'owner')
    assert.lengthOf(owners, 1)
  })

  test('registration ignores privileged fields, hashes passwords and signs in', async ({
    client,
    assert,
  }) => {
    const response = await client
      .post('/register')
      .withCsrfToken()
      .redirects(0)
      .header('Accept-Language', 'vi')
      .json({ ...customerInput, role: 'owner', id: 99 })
    response.assertStatus(302)
    response.assertHeader('location', '/account')
    const user = await User.findByOrFail('email', customerInput.email)
    assert.equal(user.role, 'customer')
    assert.notEqual(user.id, 99)
    assert.equal(user.preferredLocale, 'vi')
    assert.notEqual(user.password, password)
    assert.isTrue(await user.verifyPassword(password))
    response.assertSession('auth_web', user.id)
  })

  test('duplicate normalized email is rejected with Vietnamese validation', async ({
    client,
    assert,
  }) => {
    await User.create({ ...customerDetails, role: 'customer' })
    const response = await client
      .post('/register')
      .withCsrfToken()
      .header('Accept', 'application/json')
      .header('Accept-Language', 'vi')
      .json({ ...customerInput, email: 'CUSTOMER@example.test' })
    response.assertStatus(422)
    assert.include(response.text(), 'Địa chỉ email này đã được đăng ký.')
  })

  test('registration requires capability and merchant registration permission', async ({
    client,
  }) => {
    const store = await StoreSetting.findOrFail(1)
    for (const changes of [
      { registrationEnabled: false, customerAccountsEnabled: true },
      { registrationEnabled: true, customerAccountsEnabled: false },
    ]) {
      await store.merge(changes).save()
      const response = await client
        .post('/register')
        .withCsrfToken()
        .json(customerInput)
        .redirects(0)
      response.assertStatus(403)
    }
  })

  test('login verifies credentials and logout removes authentication', async ({ client }) => {
    const user = await User.create({ ...customerDetails, role: 'customer' })
    const denied = await client
      .post('/login')
      .withCsrfToken()
      .header('Accept', 'application/json')
      .json({ email: user.email, password: 'wrong-password' })
    denied.assertStatus(422)
    const signedIn = await client
      .post('/login')
      .withCsrfToken()
      .redirects(0)
      .json({ email: 'CUSTOMER@example.test', password })
    signedIn.assertStatus(302)
    signedIn.assertSession('auth_web', user.id)
    const loggedOut = await client
      .post('/logout')
      .withSession(signedIn.session())
      .withCsrfToken()
      .redirects(0)
    loggedOut.assertStatus(302)
    loggedOut.assertSessionMissing('auth_web')
    const account = await client.get('/account').withSession(loggedOut.session()).redirects(0)
    account.assertStatus(302)
    account.assertHeader('location', '/login')
  })

  test('disabled customer accounts block login and existing sessions but preserve owner access', async ({
    client,
  }) => {
    const store = await StoreSetting.findOrFail(1)
    await store.merge({ customerAccountsEnabled: false }).save()
    const customer = await User.create({ ...customerDetails, role: 'customer' })
    const owner = await User.create({
      ...customerDetails,
      email: 'owner@example.test',
      role: 'owner',
    })
    const login = await client
      .post('/login')
      .withCsrfToken()
      .header('Accept', 'application/json')
      .json({ email: customer.email, password })
    login.assertStatus(422)
    const account = await client.get('/account').loginAs(customer).redirects(0)
    account.assertStatus(302)
    account.assertSessionMissing('auth_web')
    const admin = await client.get('/admin/settings').loginAs(owner)
    admin.assertStatus(200)
  })

  test('profile changes are scoped to the authenticated customer', async ({ client, assert }) => {
    const user = await User.create({ ...customerDetails, role: 'customer' })
    const other = await User.create({
      ...customerDetails,
      email: 'other@example.test',
      role: 'customer',
    })
    const response = await client
      .patch('/account')
      .loginAs(user)
      .withCsrfToken()
      .redirects(0)
      .json({ fullName: 'Updated name', id: other.id, role: 'owner', email: other.email })
    response.assertStatus(302)
    await user.refresh()
    await other.refresh()
    assert.equal(user.fullName, 'Updated name')
    assert.equal(user.role, 'customer')
    assert.equal(user.email, customerInput.email)
    assert.equal(other.fullName, customerInput.fullName)
  })

  test('authentication requests are rate limited', async ({ client }) => {
    for (let attempt = 0; attempt < 10; attempt++) {
      const response = await client
        .post('/login')
        .withCsrfToken()
        .header('Accept', 'application/json')
        .json({ email: 'missing@example.test', password })
      response.assertStatus(422)
    }
    const blocked = await client
      .post('/login')
      .withCsrfToken()
      .header('Accept', 'application/json')
      .json({ email: 'missing@example.test', password })
    blocked.assertStatus(429)
  })
})
