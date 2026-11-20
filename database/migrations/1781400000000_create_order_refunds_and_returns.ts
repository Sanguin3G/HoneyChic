import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.createTable('order_refunds', (table) => {
      table.increments('id')
      table.integer('order_id').notNullable().references('orders.id').onDelete('RESTRICT')
      table.integer('actor_id').nullable().references('users.id').onDelete('SET NULL')
      table.bigInteger('amount_minor').notNullable()
      table.string('reference', 100).notNullable()
      table.text('note').notNullable().defaultTo('')
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.unique(['order_id', 'reference'])
      table.check('amount_minor > 0 AND amount_minor <= 9007199254740991')
      table.check('length(btrim(reference)) > 0')
      table.index(['order_id'])
    })

    this.schema.createTable('order_returns', (table) => {
      table.increments('id')
      table.integer('order_id').notNullable().references('orders.id').onDelete('RESTRICT')
      table.integer('order_item_id').notNullable().references('order_items.id').onDelete('RESTRICT')
      table.integer('actor_id').nullable().references('users.id').onDelete('SET NULL')
      table.integer('quantity').notNullable()
      table.string('reference', 100).notNullable()
      table.text('note').notNullable().defaultTo('')
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.unique(['order_id', 'reference'])
      table.check('quantity > 0 AND quantity <= 2147483647')
      table.check('length(btrim(reference)) > 0')
      table.index(['order_id'])
      table.index(['order_item_id'])
    })
  }

  async down() {
    this.schema.dropTable('order_returns')
    this.schema.dropTable('order_refunds')
  }
}
