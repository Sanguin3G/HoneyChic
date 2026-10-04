import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.alterTable('orders', (table) => {
      table.string('locale', 2).notNullable().defaultTo('en')
      table.check("locale IN ('en', 'vi')", [], 'orders_locale_check')
    })
    this.schema.createTable('password_reset_tokens', (table) => {
      table.uuid('id').primary()
      table.integer('user_id').notNullable().references('users.id').onDelete('CASCADE')
      table.text('token_hash').notNullable()
      table.timestamp('expires_at', { useTz: true }).notNullable()
      table.timestamp('used_at', { useTz: true }).nullable()
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.index(['user_id'])
    })
    this.schema.createTable('order_recovery_tokens', (table) => {
      table.uuid('id').primary()
      table.integer('order_id').notNullable().references('orders.id').onDelete('RESTRICT')
      table.text('token_hash').notNullable()
      table.timestamp('expires_at', { useTz: true }).notNullable()
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.index(['order_id'])
    })
  }

  async down() {
    this.schema.dropTable('order_recovery_tokens')
    this.schema.dropTable('password_reset_tokens')
    this.schema.raw('ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_locale_check')
    this.schema.alterTable('orders', (table) => {
      table.dropColumn('locale')
    })
  }
}
