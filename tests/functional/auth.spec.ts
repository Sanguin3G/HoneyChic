import { test } from '@japa/runner'
import { DateTime } from 'luxon'
import testUtils from '@adonisjs/core/services/test_utils'
import mail from '@adonisjs/mail/services/main'
import hash from '@adonisjs/core/services/hash'
import CreateInitialOwner from '#domains/customers/actions/create_initial_owner'
import User from '#domains/customers/models/user'
import StoreSetting from '#core/store/store_setting'
import EmailVerificationToken from '#domains/customers/models/email_verification_token'
import { mailFrom } from '#core/support/mail_sender'
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
    const user = await User.findByOrFail('email', customerInput.email)
    assert.equal(user.role, 'customer')
    assert.notEqual(user.id, 99)
    assert.equal(user.preferredLocale, 'vi')
    assert.notEqual(user.password, password)
    assert.isTrue(await user.verifyPassword(password))
    const store = await StoreSetting.findOrFail(1)
    if (mailFrom(store)) {
      response.assertHeader('location', '/login')
      response.assertSessionMissing('auth_web')
      assert.isTrue(user.requiresEmailVerification)
      assert.isNull(user.emailVerifiedAt)
    } else {
      response.assertHeader('location', '/account')
      response.assertSession('auth_web', user.id)
      assert.isFalse(user.requiresEmailVerification)
    }
  })

  test('the login page renders', async ({ client }) => {
    const page = await client.get('/login').header('Accept', 'text/html')
    page.assertStatus(200)
  })

  test('a new customer confirms email with one hashed link when mail can be sent', async ({
    client,
    assert,
  }) => {
    const store = await StoreSetting.findOrFail(1)
    if (!mailFrom(store)) return
    const fake = mail.fake()
    try {
      const created = await client
        .post('/register')
        .withCsrfToken()
        .redirects(0)
        .header('Accept-Language', 'vi')
        .json({ ...customerInput, email: 'confirm@example.test' })
      created.assertStatus(302)
      created.assertHeader('location', '/login')
      const user = await User.findByOrFail('email', 'confirm@example.test')
      for (let attempt = 0; attempt < 100 && fake.messages.sent().length < 1; attempt++) {
        await new Promise((resolve) => setTimeout(resolve, 20))
      }
      const text = fake.messages.sent()[0].nodeMailerMessage.text
      if (typeof text !== 'string') throw new Error('Expected a confirmation email')
      const match = text.match(/\/email\/verify\/([0-9a-f-]{36})\/([A-Za-z0-9_-]{43})/)
      if (!match) throw new Error('Expected a confirmation link')
      const link = { id: match[1], secret: match[2], path: match[0] }
      const token = await EmailVerificationToken.findOrFail(link.id)
      assert.notEqual(token.tokenHash, link.secret)
      assert.isTrue(await hash.verify(token.tokenHash, link.secret))
      assert.notInclude(text, token.tokenHash)
      const blocked = await client
        .post('/login')
        .withCsrfToken()
        .header('Accept', 'application/json')
        .header('Accept-Language', 'vi')
        .json({ email: user.email, password })
      blocked.assertStatus(422)
      assert.include(blocked.text(), 'Hãy xác nhận email này trước khi đăng nhập.')
      await user.refresh()
      assert.isNull(user.emailVerifiedAt)
      const wrongSecret =
        link.secret[0] === 'a' ? 'b' + link.secret.slice(1) : 'a' + link.secret.slice(1)
      const wrong = await client
        .post(`/email/verify/${link.id}/${wrongSecret}`)
        .withCsrfToken()
        .redirects(1)
        .header('Accept', 'text/html')
        .header('Accept-Language', 'vi')
      wrong.assertStatus(200)
      assert.include(wrong.text(), 'không hợp lệ hoặc đã hết hạn')
      await user.refresh()
      assert.isNull(user.emailVerifiedAt)
      await token.merge({ expiresAt: DateTime.utc().minus({ minutes: 1 }) }).save()
      const expired = await client
        .post(link.path)
        .withCsrfToken()
        .redirects(1)
        .header('Accept', 'text/html')
        .header('Accept-Language', 'vi')
      expired.assertStatus(200)
      assert.include(expired.text(), 'không hợp lệ hoặc đã hết hạn')
      const again = await client
        .post('/email/verify')
        .withCsrfToken()
        .redirects(0)
        .json({ email: 'missing@example.test' })
      again.assertStatus(302)
      assert.lengthOf(await EmailVerificationToken.query().whereNull('usedAt'), 1)
      const resent = await client
        .post('/email/verify')
        .withCsrfToken()
        .redirects(0)
        .header('Accept-Language', 'en')
        .json({ email: user.email })
      resent.assertStatus(302)
      for (let attempt = 0; attempt < 100 && fake.messages.sent().length < 2; attempt++) {
        await new Promise((resolve) => setTimeout(resolve, 20))
      }
      const latest = fake.messages.sent()[1].nodeMailerMessage.text
      if (typeof latest !== 'string') throw new Error('Expected a second confirmation email')
      const current = latest.match(/\/email\/verify\/([0-9a-f-]{36})\/([A-Za-z0-9_-]{43})/)
      if (!current) throw new Error('Expected a fresh confirmation link')
      const confirmed = await client
        .post(current[0])
        .withCsrfToken()
        .redirects(0)
        .header('Accept', 'text/html')
      confirmed.assertStatus(302)
      confirmed.assertHeader('location', '/login')
      await user.refresh()
      assert.isNotNull(user.emailVerifiedAt)
      const signedIn = await client
        .post('/login')
        .withCsrfToken()
        .redirects(0)
        .json({ email: user.email, password })
      signedIn.assertStatus(302)
      signedIn.assertSession('auth_web', user.id)
    } finally {
      mail.restore()
    }
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
