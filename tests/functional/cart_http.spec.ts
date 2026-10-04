import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { cartSessionKey, emptyCart, type CartState } from '#domains/cart/data/cart_state'
import limiter from '@adonisjs/limiter/services/main'
import User from '#domains/customers/models/user'
import { cartFixture, inertiaPage, repriceCartProduct } from '../support/cart_fixture.js'

test.group('Cart HTTP boundaries', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())
  group.each.setup(() => limiter.clear(['memory']))
  test('guests add, change and remove variants; submitted prices are ignored and sessions stay isolated', async ({
    client,
    assert,
  }) => {
    const { variants } = await cartFixture()
    const added = await client.post('/cart/items').withCsrfToken().redirects(0).json({
      variantId: variants[0].id,
      quantity: 2,
      priceMinor: 1,
      totalMinor: 2,
      currency: 'VND',
    })
    added.assertStatus(302)
    added.assertHeader('location', '/cart')
    const state = added.session(cartSessionKey) as CartState
    assert.deepEqual(state, { currency: 'USD', lines: [[variants[0].id, 2, 1000]] })
    const second = await client
      .post('/cart/items')
      .withSession({ cart: state })
      .withCsrfToken()
      .redirects(0)
      .json({ variantId: variants[1].id, quantity: 1 })
    second.assertStatus(302)
    const two = second.session(cartSessionKey) as CartState
    const updated = await client
      .patch('/cart/items/' + variants[0].id)
      .withSession({ cart: two })
      .withCsrfToken()
      .redirects(0)
      .json({ quantity: 3 })
    updated.assertStatus(302)
    const changed = updated.session(cartSessionKey) as CartState
    for (const locale of ['en', 'vi']) {
      const page = await client
        .get('/cart')
        .withSession({ cart: changed })
        .header('Accept', 'text/html')
        .header('Accept-Language', locale)
      page.assertStatus(200)
      const props = inertiaPage(page.text()).props
      assert.equal(props.cart.totalMinor, 4000)
      assert.equal(props.cartQuantity, 4)
      assert.equal(props.locale, locale)
      assert.isNull(props.auth)
    }
    const other = await client.get('/cart').header('Accept', 'text/html')
    assert.lengthOf(inertiaPage(other.text()).props.cart.items, 0)
    const removed = await client
      .delete('/cart/items/' + variants[0].id)
      .withSession({ cart: changed })
      .withCsrfToken()
      .redirects(0)
    removed.assertStatus(302)
    assert.lengthOf(removed.session(cartSessionKey).lines, 1)
    const cleared = await client
      .delete('/cart')
      .withSession({ cart: removed.session(cartSessionKey) })
      .withCsrfToken()
      .redirects(0)
    cleared.assertStatus(302)
    cleared.assertSession(cartSessionKey, emptyCart())
  })
  test('localized quantity and stock validation cannot alter the existing cart', async ({
    client,
    assert,
  }) => {
    const { variants } = await cartFixture()
    const state: CartState = { currency: 'USD', lines: [[variants[0].id, 2, 1000]] }
    const excessive = await client
      .post('/cart/items')
      .withSession({ cart: state })
      .withCsrfToken()
      .header('Accept', 'application/json')
      .header('Accept-Language', 'vi')
      .json({ variantId: variants[0].id, quantity: 4 })
    excessive.assertStatus(422)
    assert.include(excessive.text(), 'Không đủ hàng')
    excessive.assertSession(cartSessionKey, state)
    for (const quantity of [0, 1.5, 100]) {
      const invalid = await client
        .patch('/cart/items/' + variants[0].id)
        .withSession({ cart: state })
        .withCsrfToken()
        .header('Accept', 'application/json')
        .json({ quantity })
      invalid.assertStatus(422)
      invalid.assertSession(cartSessionKey, state)
    }
  })
  test('reads reprice safely, missing lines remain removable, and login/locale switching retain the cart', async ({
    client,
    assert,
  }) => {
    const { product, variants } = await cartFixture()
    const state: CartState = {
      currency: 'USD',
      lines: [
        [variants[0].id, 2, 1000],
        [2147483647, 1, 1000],
      ],
    }
    await repriceCartProduct(product.id, '11')
    const page = await client
      .get('/cart')
      .withSession({ cart: state })
      .header('Accept', 'text/html')
    const view = inertiaPage(page.text()).props.cart
    assert.isTrue(view.items[0].priceChanged)
    assert.equal(view.items[0].unitPriceMinor, 1100)
    assert.isNull(view.items[1].product)
    assert.isNull(view.totalMinor)
    page.assertSession(cartSessionKey, state)
    const removed = await client
      .delete('/cart/items/2147483647')
      .withSession({ cart: state })
      .withCsrfToken()
      .redirects(0)
    removed.assertStatus(302)
    assert.lengthOf(removed.session(cartSessionKey).lines, 1)
    const user = await User.create({
      fullName: 'Cart Customer',
      email: 'cart@account.test',
      password: 'test-password-123456',
      role: 'customer',
    })
    const login = await client
      .post('/login')
      .withSession({ cart: state })
      .withCsrfToken()
      .redirects(0)
      .json({ email: user.email, password: 'test-password-123456' })
    login.assertStatus(302)
    login.assertSession(cartSessionKey, state)
    const locale = await client
      .post('/locale')
      .withSession({ cart: state })
      .withCsrfToken()
      .redirects(0)
      .json({ locale: 'vi', destination: '/cart' })
    locale.assertStatus(302)
    locale.assertHeader('location', '/cart')
    locale.assertSession(cartSessionKey, state)
  })
})
