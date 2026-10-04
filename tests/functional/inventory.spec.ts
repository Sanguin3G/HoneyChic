import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import db from '@adonisjs/lucid/services/db'
import CreateProduct from '#domains/catalog/actions/create_product'
import UpdateProduct from '#domains/catalog/actions/update_product'
import { loadProduct } from '#domains/catalog/queries/load_product'
import { productEditor } from '#domains/catalog/data/product_data'
import ProductVariant from '#domains/catalog/models/product_variant'
import InventoryMovement from '#domains/inventory/models/inventory_movement'
import AdjustInventory from '#domains/inventory/actions/adjust_inventory'
import { maximumStock } from '#domains/inventory/data/movement_reasons'
import { listInventory } from '#domains/inventory/queries/list_inventory'
import type { ProductInput } from '#domains/catalog/validators/catalog'

async function fixture() {
  const input: ProductInput = {
    name: 'Keyboard',
    slug: 'stock-keyboard',
    description: '',
    categoryId: null,
    status: 'published',
    options: [{ name: 'Switch', values: ['Linear', 'Tactile'] }],
    images: [],
    variants: [
      { sku: 'LINEAR', price: '10', selections: ['Linear'] },
      { sku: 'TACTILE', price: '11', selections: ['Tactile'] },
    ],
  }
  const product = await new CreateProduct().execute(input, 'USD', 'en')
  return loadProduct(product.id)
}
test.group('Inventory integrity', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('stock starts at zero and changes record exact balances and references', async ({
    assert,
  }) => {
    const product = await fixture()
    const variant = product.variants[0]
    assert.equal(variant.stock, 0)
    const action = new AdjustInventory()
    const initial = await action.execute(
      {
        variantId: variant.id,
        quantityDelta: 5,
        reason: 'initial_stock',
        actorId: null,
        reference: 'Opening count',
        note: 'Shelf A',
      },
      'en'
    )
    assert.equal(initial.stockAfter, 5)
    assert.equal(initial.reference, 'Opening count')
    assert.equal(initial.note, 'Shelf A')
    const sale = await action.execute(
      { variantId: variant.id, quantityDelta: -2, reason: 'sale', actorId: null },
      'en'
    )
    assert.equal(sale.stockAfter, 3)
    const current = await ProductVariant.findOrFail(variant.id)
    assert.equal(current.stock, 3)
    assert.lengthOf(await InventoryMovement.query().where('productVariantId', variant.id), 2)
  })

  test('negative, fractional, zero, overflowing and wrong-direction changes are rejected atomically', async ({
    assert,
  }) => {
    const product = await fixture()
    const variantId = product.variants[0].id
    const action = new AdjustInventory()
    for (const quantityDelta of [-1, 0, 0.5, maximumStock + 1]) {
      await assert.rejects(() =>
        action.execute(
          { variantId, quantityDelta, reason: 'manual_adjustment', actorId: null },
          'en'
        )
      )
    }
    await assert.rejects(() =>
      action.execute({ variantId, quantityDelta: -1, reason: 'restock', actorId: null }, 'en')
    )
    await action.execute(
      { variantId, quantityDelta: maximumStock, reason: 'initial_stock', actorId: null },
      'en'
    )
    await assert.rejects(() =>
      action.execute({ variantId, quantityDelta: 1, reason: 'restock', actorId: null }, 'en')
    )
    await assert.rejects(() =>
      db.transaction(async (trx) => {
        await trx.from('product_variants').where('id', variantId).update({ stock: -1 })
      })
    )
    const variant = await ProductVariant.findOrFail(variantId)
    assert.equal(variant.stock, maximumStock)
    assert.lengthOf(await InventoryMovement.query().where('productVariantId', variantId), 1)
  })

  test('a movement insert failure rolls back its stock update', async ({ assert }) => {
    const product = await fixture()
    const variantId = product.variants[0].id
    await assert.rejects(() =>
      new AdjustInventory().execute(
        { variantId, quantityDelta: 5, reason: 'initial_stock', actorId: 2147483647 },
        'en'
      )
    )
    const variant = await ProductVariant.findOrFail(variantId)
    assert.equal(variant.stock, 0)
    assert.lengthOf(await InventoryMovement.query().where('productVariantId', variantId), 0)
  })

  test('caller rollback undoes stock and movement, and initial stock cannot be repeated', async ({
    assert,
  }) => {
    const product = await fixture()
    const variantId = product.variants[0].id
    const action = new AdjustInventory()
    const transaction = await db.transaction()
    try {
      await action.execute(
        { variantId, quantityDelta: 7, reason: 'initial_stock', actorId: null },
        'en',
        transaction
      )
    } finally {
      await transaction.rollback()
    }
    const unchanged = await ProductVariant.findOrFail(variantId)
    assert.equal(unchanged.stock, 0)
    assert.lengthOf(await InventoryMovement.query().where('productVariantId', variantId), 0)
    await action.execute(
      { variantId, quantityDelta: 7, reason: 'initial_stock', actorId: null },
      'en'
    )
    await assert.rejects(() =>
      action.execute({ variantId, quantityDelta: 7, reason: 'initial_stock', actorId: null }, 'en')
    )
  })

  test('catalog edits preserve stock and cannot retire stocked variants', async ({ assert }) => {
    const product = await fixture()
    const stocked = product.variants[1]
    const adjustment = new AdjustInventory()
    await adjustment.execute(
      { variantId: stocked.id, quantityDelta: 4, reason: 'initial_stock', actorId: null },
      'en'
    )
    const input = productEditor(await loadProduct(product.id))
    input.name = 'Edited keyboard'
    await new UpdateProduct().execute(product.id, input, 'en')
    const preserved = await ProductVariant.findOrFail(stocked.id)
    assert.equal(preserved.stock, 4)
    input.variants.splice(1)
    await assert.rejects(() => new UpdateProduct().execute(product.id, input, 'en'))
    await adjustment.execute(
      { variantId: stocked.id, quantityDelta: -4, reason: 'correction', actorId: null },
      'en'
    )
    await new UpdateProduct().execute(product.id, input, 'en')
    const retired = await ProductVariant.findOrFail(stocked.id)
    assert.isFalse(retired.isActive)
    assert.lengthOf(await InventoryMovement.query().where('productVariantId', stocked.id), 2)
    await assert.rejects(() =>
      adjustment.execute(
        { variantId: stocked.id, quantityDelta: 1, reason: 'restock', actorId: null },
        'en'
      )
    )
  })

  test('low-stock filters use the merchant threshold and keep zero stock separate', async ({
    assert,
  }) => {
    const product = await fixture()
    const variantId = product.variants[0].id
    await new AdjustInventory().execute(
      { variantId, quantityDelta: 3, reason: 'initial_stock', actorId: null },
      'en'
    )
    assert.lengthOf(await listInventory({ state: 'low' }, 3), 1)
    assert.lengthOf(await listInventory({ state: 'low' }, 2), 0)
    assert.lengthOf(await listInventory({ state: 'out' }, 3), 1)
    assert.lengthOf(await listInventory({ q: '%' }, 3), 0)
  })
})
