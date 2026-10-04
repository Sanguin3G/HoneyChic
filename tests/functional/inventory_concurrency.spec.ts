import { test } from '@japa/runner'
import { randomUUID } from 'node:crypto'
import db from '@adonisjs/lucid/services/db'
import CreateProduct from '#domains/catalog/actions/create_product'
import ProductVariant from '#domains/catalog/models/product_variant'
import InventoryMovement from '#domains/inventory/models/inventory_movement'
import AdjustInventory from '#domains/inventory/actions/adjust_inventory'

// Real independent connections are essential here: a global test transaction would hide races.
test('two independent stock deductions cannot consume the last item twice', async ({ assert }) => {
  const unique = randomUUID()
  const product = await new CreateProduct().execute(
    {
      name: 'Concurrent item',
      slug: unique,
      description: '',
      categoryId: null,
      status: 'draft',
      options: [],
      images: [],
      variants: [{ sku: unique.toUpperCase(), price: '1', selections: [] }],
    },
    'USD',
    'en'
  )
  const variant = await ProductVariant.findByOrFail('productId', product.id)
  const action = new AdjustInventory()
  let first: Awaited<ReturnType<typeof db.transaction>> | undefined
  let second: Awaited<ReturnType<typeof db.transaction>> | undefined
  let firstDone = false
  let secondDone = false
  try {
    await action.execute(
      { variantId: variant.id, quantityDelta: 1, reason: 'initial_stock', actorId: null },
      'en'
    )
    first = await db.transaction()
    second = await db.transaction()
    const firstBackend = await first.rawQuery('SELECT pg_backend_pid() AS pid')
    const secondBackend = await second.rawQuery('SELECT pg_backend_pid() AS pid')
    assert.notEqual(firstBackend.rows[0].pid, secondBackend.rows[0].pid)
    const input = {
      variantId: variant.id,
      quantityDelta: -1,
      reason: 'sale' as const,
      actorId: null,
    }
    await action.execute(input, 'en', first)
    const pending = action.execute(input, 'en', second).then(
      () => null,
      (error) => error
    )
    let waiting = false
    for (let attempt = 0; attempt < 40; attempt++) {
      const activity = await db.rawQuery(
        'SELECT wait_event_type FROM pg_stat_activity WHERE pid = ?',
        [secondBackend.rows[0].pid]
      )
      if (activity.rows[0]?.wait_event_type === 'Lock') {
        waiting = true
        break
      }
      await new Promise((resolve) => setTimeout(resolve, 25))
    }
    // Release before asserting so a failed assertion never leaves a blocked query.
    await first.commit()
    firstDone = true
    const failure = await pending
    await second.rollback()
    secondDone = true
    assert.isTrue(waiting, 'The second connection must contend for the first transaction’s lock')
    assert.instanceOf(failure, Error)
    assert.include(failure.message, 'Validation')
    const remaining = await ProductVariant.findOrFail(variant.id)
    assert.equal(remaining.stock, 0)
    const sales = await InventoryMovement.query()
      .where('productVariantId', variant.id)
      .where('reason', 'sale')
    assert.lengthOf(sales, 1)
  } finally {
    if (first && !firstDone) await first.rollback()
    if (second && !secondDone) await second.rollback()
    await db.from('inventory_movements').where('product_variant_id', variant.id).delete()
    await db.from('product_variants').where('id', variant.id).delete()
    await db.from('products').where('id', product.id).delete()
  }
})
