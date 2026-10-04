import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.alterTable('product_variants', (table) => {
      table.integer('stock').notNullable().defaultTo(0)
      table.check('stock >= 0', [], 'product_variants_stock_nonnegative')
    })
    this.schema.createTable('inventory_movements', (table) => {
      table.increments('id')
      table
        .integer('product_variant_id')
        .notNullable()
        .references('product_variants.id')
        .onDelete('RESTRICT')
      table.integer('quantity_delta').notNullable()
      table.integer('stock_after').notNullable()
      table.string('reason', 24).notNullable()
      table.string('reference', 200).nullable()
      table.text('note').notNullable().defaultTo('')
      table.integer('actor_id').nullable().references('users.id').onDelete('SET NULL')
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.check('quantity_delta <> 0 AND stock_after >= 0')
      table.check(
        "reason IN ('initial_stock', 'sale', 'cancellation', 'manual_adjustment', 'restock', 'return', 'correction')"
      )
      table.index(['product_variant_id', 'id'])
    })
    this.schema.raw(
      "CREATE UNIQUE INDEX inventory_movements_initial_idx ON inventory_movements (product_variant_id) WHERE reason = 'initial_stock'"
    )
  }
  async down() {
    this.schema.dropTable('inventory_movements')
    this.schema.alterTable('product_variants', (table) => {
      table.dropChecks('product_variants_stock_nonnegative')
      table.dropColumn('stock')
    })
  }
}
