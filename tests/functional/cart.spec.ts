import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import ChangeCartQuantity from '#domains/cart/actions/change_cart_quantity'
import { emptyCart, maximumCartLines, type CartState } from '#domains/cart/data/cart_state'
import { readCart } from '#domains/cart/queries/read_cart'
import ProductVariant from '#domains/catalog/models/product_variant'
import InventoryMovement from '#domains/inventory/models/inventory_movement'
import AdjustInventory from '#domains/inventory/actions/adjust_inventory'
import { cartFixture, repriceCartProduct } from '../support/cart_fixture.js'
const action = new ChangeCartQuantity()
test.group('Cart integrity', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())
  test('variant quantities accumulate independently using exact server prices without reserving stock', async ({
    assert,
  }) => {
    const { variants } = await cartFixture()
    const first = await action.execute(
      emptyCart(),
      { variantId: variants[0].id, quantity: 2, mode: 'add' },
      'en'
    )
    let cart = await action.execute(
      first,
      { variantId: variants[0].id, quantity: 2, mode: 'add' },
      'en'
    )
    cart = await action.execute(cart, { variantId: variants[1].id, quantity: 2, mode: 'add' }, 'en')
    const view = await readCart(cart)
    assert.equal(view.quantity, 6)
    assert.equal(view.totalMinor, 6000)
    assert.equal(first.lines[0][1], 2)
    assert.lengthOf(view.items, 2)
    for (const variant of variants) {
      const current = await ProductVariant.findOrFail(variant.id)
      assert.equal(current.stock, 5)
    }
    assert.lengthOf(await InventoryMovement.all(), 2)
  })
  test('invalid, excessive and absent-item quantities reject without changing the supplied state', async ({
    assert,
  }) => {
    const { variants } = await cartFixture()
    const state = await action.execute(
      emptyCart(),
      { variantId: variants[0].id, quantity: 4, mode: 'add' },
      'en'
    )
    for (const quantity of [0, -1, 0.5, 100])
      await assert.rejects(() =>
        action.execute(state, { variantId: variants[0].id, quantity, mode: 'replace' }, 'en')
      )
    await assert.rejects(() =>
      action.execute(state, { variantId: variants[0].id, quantity: 2, mode: 'add' }, 'en')
    )
    await assert.rejects(() =>
      action.execute(state, { variantId: variants[1].id, quantity: 1, mode: 'replace' }, 'en')
    )
    await assert.rejects(() =>
      action.execute(state, { variantId: 2147483647, quantity: 1, mode: 'add' }, 'en')
    )
    assert.deepEqual(state.lines, [[variants[0].id, 4, 1000]])
  })
  test('current prices replace cached display prices while the original price remains visible after quantity edits', async ({
    assert,
  }) => {
    const { product, variants } = await cartFixture()
    const state = await action.execute(
      emptyCart(),
      { variantId: variants[0].id, quantity: 2, mode: 'add' },
      'en'
    )
    await repriceCartProduct(product.id, '15.25')
    const view = await readCart(state)
    assert.equal(view.totalMinor, 3050)
    assert.equal(view.items[0].previousPriceMinor, 1000)
    assert.isTrue(view.items[0].priceChanged)
    const updated = await action.execute(
      state,
      { variantId: variants[0].id, quantity: 1, mode: 'replace' },
      'en'
    )
    assert.equal(updated.lines[0][2], 1000)
    const updatedView = await readCart(updated)
    assert.equal(updatedView.totalMinor, 1525)
  })
  test('stock decreases mark the cart invalid until quantity is reduced; cart changes create no movements', async ({
    assert,
  }) => {
    const { variants } = await cartFixture()
    const state = await action.execute(
      emptyCart(),
      { variantId: variants[0].id, quantity: 2, mode: 'add' },
      'en'
    )
    await new AdjustInventory().execute(
      { variantId: variants[0].id, quantityDelta: -4, reason: 'manual_adjustment', actorId: null },
      'en'
    )
    const view = await readCart(state)
    assert.equal(view.items[0].issue, 'insufficient')
    assert.isNull(view.totalMinor)
    assert.notProperty(view.items[0], 'stock')
    const updated = await action.execute(
      state,
      { variantId: variants[0].id, quantity: 1, mode: 'replace' },
      'en'
    )
    const updatedView = await readCart(updated)
    assert.equal(updatedView.totalMinor, 1000)
    assert.lengthOf(await InventoryMovement.all(), 3)
  })
  test('unpublished, hidden-category and retired variants cannot be added or expose current private content', async ({
    assert,
  }) => {
    const { product, category, variants } = await cartFixture()
    const state = await action.execute(
      emptyCart(),
      { variantId: variants[0].id, quantity: 1, mode: 'add' },
      'en'
    )
    await product.merge({ status: 'draft', name: 'Private title' }).save()
    let view = await readCart(state)
    assert.isNull(view.items[0].product)
    assert.isNull(view.items[0].unitPriceMinor)
    assert.isNull(view.totalMinor)
    await assert.rejects(() =>
      action.execute(emptyCart(), { variantId: variants[0].id, quantity: 1, mode: 'add' }, 'en')
    )
    await product.merge({ status: 'published' }).save()
    await category.merge({ isActive: false }).save()
    const hiddenView = await readCart(state)
    assert.isNull(hiddenView.items[0].product)
    await assert.rejects(() =>
      action.execute(emptyCart(), { variantId: variants[0].id, quantity: 1, mode: 'add' }, 'en')
    )
    await category.merge({ isActive: true }).save()
    await new AdjustInventory().execute(
      { variantId: variants[0].id, quantityDelta: -5, reason: 'manual_adjustment', actorId: null },
      'en'
    )
    await variants[0].merge({ isActive: false }).save()
    view = await readCart(state)
    assert.equal(view.items[0].issue, 'unavailable')
    assert.isNull(view.items[0].product)
    await assert.rejects(() =>
      action.execute(emptyCart(), { variantId: variants[0].id, quantity: 1, mode: 'add' }, 'en')
    )
  })
  test('a cart cannot mix currencies or exceed its compact session line limit', async ({
    assert,
  }) => {
    const usd = await cartFixture()
    const vnd = await cartFixture('cart-coffee', 'VND', '100')
    const state = await action.execute(
      emptyCart(),
      { variantId: usd.variants[0].id, quantity: 1, mode: 'add' },
      'en'
    )
    await assert.rejects(() =>
      action.execute(state, { variantId: vnd.variants[0].id, quantity: 1, mode: 'add' }, 'en')
    )
    const full: CartState = {
      currency: 'USD',
      lines: Array.from({ length: maximumCartLines }, (_, i) => [100000 + i, 1, 1000]),
    }
    await assert.rejects(() =>
      action.execute(full, { variantId: usd.variants[0].id, quantity: 1, mode: 'add' }, 'en')
    )
    assert.equal(state.currency, 'USD')
  })
  test('zero prices are valid; line and combined total overflow never produce rounded amounts', async ({
    assert,
  }) => {
    const { product, variants } = await cartFixture('cart-money', 'USD', '0')
    const state = await action.execute(
      emptyCart(),
      { variantId: variants[0].id, quantity: 2, mode: 'add' },
      'en'
    )
    const freeView = await readCart(state)
    assert.equal(freeView.totalMinor, 0)
    await repriceCartProduct(product.id, '90071992547409.91')
    const view = await readCart(state)
    assert.isTrue(view.amountLimited)
    assert.isNull(view.totalMinor)
    assert.isNull(view.items[0].lineTotalMinor)
    await assert.rejects(() =>
      action.execute(emptyCart(), { variantId: variants[0].id, quantity: 2, mode: 'add' }, 'en')
    )
    const one = await action.execute(
      state,
      { variantId: variants[0].id, quantity: 1, mode: 'replace' },
      'en'
    )
    const oneView = await readCart(one)
    assert.equal(oneView.totalMinor, Number.MAX_SAFE_INTEGER)
    await assert.rejects(() =>
      action.execute(one, { variantId: variants[1].id, quantity: 1, mode: 'add' }, 'en')
    )
  })
})
