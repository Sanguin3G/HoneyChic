import { test } from '@japa/runner'
import { DateTime } from 'luxon'
import testUtils from '@adonisjs/core/services/test_utils'
import mail from '@adonisjs/mail/services/main'
import hash from '@adonisjs/core/services/hash'
import limiter from '@adonisjs/limiter/services/main'
import type { Message } from '@adonisjs/mail'
import StoreSetting from '#core/store/store_setting'
import User from '#domains/customers/models/user'
import PasswordResetToken from '#domains/customers/models/password_reset_token'

const password = 'test-password-123456'
const replacement = 'replacement-password-12'

function mailText(message: Message) {
  const text = message.nodeMailerMessage.text
  if (typeof text !== 'string') throw new Error('Expected the reset email to include a text body')
  return text
}

function resetLink(text: string) {
  const match = text.match(/\/password\/reset\/([0-9a-f-]{36})\/([A-Za-z0-9_-]{43})/)
  if (!match) throw new Error('Expected a password reset link')
  return { id: match[1], secret: match[2], path: match[0] }
}

test.group('Password reset', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())
  group.each.setup(() => limiter.clear(['memory']))

  test('unknown and known emails get the same response, and only a hashed single-use token works', async ({
    client,
    assert,
  }) => {
    const fake = mail.fake()
    try {
      await StoreSetting.query().where('id', 1).update({ email: 'shop@example.test' })
      const user = await User.create({
        fullName: 'Reset Customer',
        email: 'reset@example.test',
        password,
        role: 'customer',
      })
      const missing = await client
        .post('/forgot-password')
        .withCsrfToken()
        .redirects(1)
        .header('Accept', 'text/html')
        .json({ email: 'missing@example.test' })
      missing.assertStatus(200)
      assert.include(missing.text(), 'If an account exists for that email')
      assert.lengthOf(await PasswordResetToken.all(), 0)
      fake.messages.assertNoneSent()
      const sent = await client
        .post('/forgot-password')
        .withCsrfToken()
        .redirects(1)
        .header('Accept', 'text/html')
        .json({ email: 'RESET@example.test' })
      sent.assertStatus(200)
      assert.include(sent.text(), 'If an account exists for that email')
      fake.messages.assertSentCount(1)
      const link = resetLink(mailText(fake.messages.sent()[0]))
      const token = await PasswordResetToken.findOrFail(link.id)
      assert.equal(token.userId, user.id)
      assert.notEqual(token.tokenHash, link.secret)
      assert.notInclude(mailText(fake.messages.sent()[0]), token.tokenHash)
      assert.isTrue(await hash.verify(token.tokenHash, link.secret))
      const wrongSecret =
        link.secret[0] === 'a' ? 'b' + link.secret.slice(1) : 'a' + link.secret.slice(1)
      const wrong = await client
        .post(`/password/reset/${link.id}/${wrongSecret}`)
        .withCsrfToken()
        .redirects(1)
        .header('Accept', 'text/html')
        .json({ password: replacement, password_confirmation: replacement })
      wrong.assertStatus(200)
      assert.include(wrong.text(), 'invalid or has expired')
      await user.refresh()
      await token.refresh()
      assert.isTrue(await user.verifyPassword(password))
      assert.isNull(token.usedAt)
      await token.merge({ expiresAt: DateTime.utc().minus({ minutes: 1 }) }).save()
      const expired = await client
        .post(link.path)
        .withCsrfToken()
        .redirects(1)
        .header('Accept', 'text/html')
        .json({ password: replacement, password_confirmation: replacement })
      expired.assertStatus(200)
      assert.include(expired.text(), 'invalid or has expired')
      await user.refresh()
      assert.isTrue(await user.verifyPassword(password))
      const again = await client
        .post('/forgot-password')
        .withCsrfToken()
        .redirects(0)
        .json({ email: user.email })
      again.assertStatus(302)
      await token.refresh()
      assert.isNotNull(token.usedAt)
      const current = resetLink(mailText(fake.messages.sent()[1]))
      const updated = await client
        .post(current.path)
        .withCsrfToken()
        .redirects(1)
        .header('Accept', 'text/html')
        .json({ password: replacement, password_confirmation: replacement })
      updated.assertStatus(200)
      assert.include(updated.text(), 'Sign in with the new password')
      await user.refresh()
      assert.isTrue(await user.verifyPassword(replacement))
      const reused = await client
        .post(current.path)
        .withCsrfToken()
        .redirects(1)
        .header('Accept', 'text/html')
        .json({ password: password, password_confirmation: password })
      reused.assertStatus(200)
      assert.include(reused.text(), 'invalid or has expired')
      await user.refresh()
      assert.isTrue(await user.verifyPassword(replacement))
    } finally {
      mail.restore()
    }
  })
})
