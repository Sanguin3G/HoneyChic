import { test } from '@japa/runner'
import { randomUUID } from 'node:crypto'
import { DateTime } from 'luxon'
import { Client } from 'pg'
import testUtils from '@adonisjs/core/services/test_utils'
import mail from '@adonisjs/mail/services/main'
import db from '@adonisjs/lucid/services/db'
import env from '#start/env'
import hash from '@adonisjs/core/services/hash'
import limiter from '@adonisjs/limiter/services/main'
import StoreSetting from '#core/store/store_setting'
import User from '#domains/customers/models/user'
import Order from '#domains/orders/models/order'
import OrderRecoveryToken from '#domains/orders/models/order_recovery_token'
import ProductVariant from '#domains/catalog/models/product_variant'
import PlaceOrder from '#domains/orders/actions/place_order'
import { cartFixture } from '../support/cart_fixture.js'
import type { Message } from '@adonisjs/mail'

const password = 'test-password-123456'

function mailText(message: Message) {
  const text = message.nodeMailerMessage.text
  if (typeof text !== 'string') throw new Error('Expected the order email to include a text body')
  return text
}

function recoveryLink(text: string) {
  const match = text.match(/\/orders\/recover\/([0-9a-f-]{36})\/([A-Za-z0-9_-]{43})/)
  if (!match) throw new Error('Expected a guest recovery link')
  return { id: match[1], secret: match[2], path: match[0] }
}

async function enableMail() {
  await StoreSetting.query().where('id', 1).update({ email: 'shop@example.test' })
}

test.group('Order mail and guest recovery', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())
  group.each.setup(() => limiter.clear(['memory']))

  test('a guest checkout emails a reusable recovery link and a retry does not send again', async ({
    client,
    assert,
  }) => {
    const fake = mail.fake()
    try {
      await enableMail()
      const { variants } = await cartFixture()
      const token = randomUUID()
      const state = { currency: 'USD', lines: [[variants[0].id, 1, 1000]] }
      const body = {
        token,
        customerName: 'Guest Buyer',
        customerEmail: 'guest-mail@example.test',
        customerPhone: '0900000000',
        deliveryAddress: '12 Example Street',
        note: '',
        expectedTotalMinor: 1000,
      }
      const session = { cart: state, checkoutToken: token, checkoutReview: state }
      const placed = await client
        .post('/checkout')
        .withSession(session)
        .withCsrfToken()
        .redirects(0)
        .header('Accept-Language', 'vi')
        .json(body)
      placed.assertStatus(302)
      const order = await Order.findByOrFail('customerEmail', body.customerEmail)
      assert.equal(order.locale, 'vi')
      assert.equal(placed.header('location'), '/orders/' + order.publicId)
      fake.messages.assertSentCount(1)
      const text = mailText(fake.messages.sent()[0])
      assert.include(text, 'Chúng tôi đã nhận đơn')
      const link = recoveryLink(text)
      const stored = await OrderRecoveryToken.findOrFail(link.id)
      assert.notEqual(stored.tokenHash, link.secret)
      assert.notInclude(text, stored.tokenHash)
      assert.isTrue(await hash.verify(stored.tokenHash, link.secret))
      const retried = await client
        .post('/checkout')
        .withSession(session)
        .withCsrfToken()
        .redirects(0)
        .json(body)
      retried.assertStatus(302)
      fake.messages.assertSentCount(1)
      const hidden = await client
        .get('/orders/' + order.publicId)
        .withSession({})
        .header('Accept', 'text/html')
      hidden.assertStatus(404)
      const opened = await client.get(link.path).withSession({}).redirects(0)
      opened.assertStatus(302)
      opened.assertHeader('location', '/orders/' + order.publicId)
      assert.equal(opened.session('guestOrder'), order.publicId)
      const again = await client.get(link.path).withSession({}).redirects(0)
      again.assertStatus(302)
      const wrongSecret =
        link.secret[0] === 'a' ? 'b' + link.secret.slice(1) : 'a' + link.secret.slice(1)
      const wrong = await client
        .get(`/orders/recover/${link.id}/${wrongSecret}`)
        .withSession({})
        .redirects(0)
      wrong.assertStatus(404)
      await stored.merge({ expiresAt: DateTime.utc().minus({ minutes: 1 }) }).save()
      const expired = await client.get(link.path).withSession({}).redirects(0)
      expired.assertStatus(404)
    } finally {
      mail.restore()
    }
  })

  test('shipped and cancellation mail follow a real status change and account orders omit recovery links', async ({
    client,
    assert,
  }) => {
    const fake = mail.fake()
    try {
      await enableMail()
      const customer = await User.create({
        fullName: 'Mail Customer',
        email: 'mail-customer@example.test',
        password,
        role: 'customer',
      })
      const staff = await User.create({
        fullName: 'Mail Staff',
        email: 'mail-staff@example.test',
        password,
        role: 'staff',
      })
      const { variants } = await cartFixture()
      const order = await new PlaceOrder().execute(
        { currency: 'USD', lines: [[variants[0].id, 1, 1000]] },
        {
          token: randomUUID(),
          customerName: 'Mail Customer',
          customerEmail: customer.email,
          customerPhone: '123',
          deliveryAddress: '12 Example Street',
          note: '',
          expectedTotalMinor: 1000,
        },
        customer.id,
        'en'
      )
      const processing = await client
        .patch('/admin/orders/' + order.publicId)
        .loginAs(staff)
        .withCsrfToken()
        .redirects(0)
        .json({ status: 'processing' })
      processing.assertStatus(302)
      fake.messages.assertNoneSent()
      const shipped = await client
        .patch('/admin/orders/' + order.publicId)
        .loginAs(staff)
        .withCsrfToken()
        .redirects(0)
        .json({ status: 'shipped' })
      shipped.assertStatus(302)
      fake.messages.assertSentCount(1)
      const shippedText = mailText(fake.messages.sent()[0])
      assert.include(shippedText, '/orders/' + order.publicId)
      assert.notInclude(shippedText, '/orders/recover/')
      const repeated = await client
        .patch('/admin/orders/' + order.publicId)
        .loginAs(staff)
        .withCsrfToken()
        .redirects(0)
        .json({ status: 'shipped' })
      repeated.assertStatus(302)
      fake.messages.assertSentCount(1)
      const pending = await new PlaceOrder().execute(
        { currency: 'USD', lines: [[variants[1].id, 1, 1000]] },
        {
          token: randomUUID(),
          customerName: 'Mail Customer',
          customerEmail: customer.email,
          customerPhone: '123',
          deliveryAddress: '12 Example Street',
          note: '',
          expectedTotalMinor: 1000,
        },
        customer.id,
        'vi'
      )
      const cancelled = await client
        .post('/orders/' + pending.publicId + '/cancel')
        .loginAs(customer)
        .withCsrfToken()
        .redirects(0)
      cancelled.assertStatus(302)
      fake.messages.assertSentCount(2)
      const cancelledText = mailText(fake.messages.sent()[1])
      assert.include(cancelledText, 'đã hủy')
      assert.notInclude(cancelledText, '/orders/recover/')
    } finally {
      mail.restore()
    }
  })
})

test('a mail failure leaves the committed order and stock in place', async ({ client, assert }) => {
  const slug = 'mail-failure-' + randomUUID()
  const email = 'mail-failure@example.test'
  const { product, variants, category } = await cartFixture(slug, 'USD', '10', 5)
  const store = await StoreSetting.findOrFail(1)
  const previousEmail = store.email
  const outside = new Client({
    host: env.get('DB_HOST'),
    port: env.get('DB_PORT'),
    user: env.get('DB_USER'),
    password: env.get('DB_PASSWORD').release(),
    database: env.get('DB_DATABASE'),
  })
  const original = mail.send
  let seenOrders = -1
  let seenStock = -1
  let probeError: unknown = null
  mail.send = (async () => {
    try {
      const orders = await outside.query('select id from orders where customer_email = $1', [email])
      const stock = await outside.query('select stock from product_variants where id = $1', [
        variants[0].id,
      ])
      seenOrders = orders.rowCount ?? 0
      seenStock = Number(stock.rows[0]?.stock)
    } catch (error) {
      probeError = error
    }
    throw new Error('smtp down')
  }) as typeof mail.send
  try {
    await outside.connect()
    await store.merge({ email: 'shop@example.test' }).save()
    const token = randomUUID()
    const state = { currency: 'USD', lines: [[variants[0].id, 1, 1000]] }
    const response = await client
      .post('/checkout')
      .withSession({ cart: state, checkoutToken: token, checkoutReview: state })
      .withCsrfToken()
      .redirects(0)
      .json({
        token,
        customerName: 'Failure Guest',
        customerEmail: email,
        customerPhone: '0900000000',
        deliveryAddress: '12 Example Street',
        note: '',
        expectedTotalMinor: 1000,
      })
    response.assertStatus(302)
    assert.isNull(probeError)
    assert.equal(seenOrders, 1)
    assert.equal(seenStock, 4)
    const order = await Order.findByOrFail('customerEmail', email)
    assert.equal(order.paymentStatus, 'unpaid')
    const variant = await ProductVariant.findOrFail(variants[0].id)
    assert.equal(variant.stock, 4)
    const page = await client
      .get('/orders/' + order.publicId)
      .withSession({ guestOrder: order.publicId })
      .header('Accept', 'text/html')
    page.assertStatus(200)
    assert.include(page.text(), 'The order was saved, but the email could not be sent.')
  } finally {
    mail.send = original
    await outside.end().catch(() => undefined)
    const orders = await Order.query().where('customerEmail', email)
    const ids = orders.map((order) => order.id)
    if (ids.length) {
      await db.from('order_recovery_tokens').whereIn('order_id', ids).delete()
      await db.from('order_items').whereIn('order_id', ids).delete()
      await db.from('orders').whereIn('id', ids).delete()
    }
    await db
      .from('inventory_movements')
      .whereIn(
        'product_variant_id',
        variants.map((variant) => variant.id)
      )
      .delete()
    await db.from('product_variants').where('product_id', product.id).delete()
    await db.from('product_options').where('product_id', product.id).delete()
    await db.from('product_images').where('product_id', product.id).delete()
    await product.delete()
    await category.delete()
    await store.merge({ email: previousEmail }).save()
  }
})
