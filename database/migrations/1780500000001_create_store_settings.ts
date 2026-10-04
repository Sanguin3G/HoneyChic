import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.createTable('store_settings', (table) => {
      table.integer('id').primary()
      table.string('name', 120).notNullable()
      table.text('description').notNullable().defaultTo('')
      table.string('email', 254).nullable()
      table.string('phone', 40).nullable()
      table.text('address').notNullable().defaultTo('')
      table.string('currency', 3).notNullable()
      table.string('default_locale', 2).notNullable()
      table.string('timezone', 80).notNullable()
      table.string('order_prefix', 12).notNullable().defaultTo('HC')
      table.integer('low_stock_threshold').notNullable().defaultTo(5)
      table.boolean('customer_accounts_enabled').notNullable().defaultTo(true)
      table.boolean('registration_enabled').notNullable().defaultTo(true)
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).nullable()
      table.check('id = 1')
      table.check("default_locale IN ('en', 'vi')")
      table.check("currency ~ '^[A-Z]{3}$'")
      table.check('low_stock_threshold >= 0')
    })
  }

  async down() {
    this.schema.dropTable('store_settings')
  }
}
