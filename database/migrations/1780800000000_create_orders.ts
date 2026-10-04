import { BaseSchema } from '@adonisjs/lucid/schema'
export default class extends BaseSchema {
  async up() {
    this.schema.alterTable('store_settings', (table) => {
      table.boolean('guest_checkout_enabled').notNullable().defaultTo(true)
    })
    this.schema.createTable('orders', (table) => {
      table.increments('id')
      table.uuid('public_id').notNullable().unique()
      table.uuid('checkout_key').notNullable().unique()
      table.string('number', 40).notNullable().unique()
      table.integer('customer_id').nullable().references('users.id').onDelete('SET NULL')
      table.string('status', 24).notNullable().defaultTo('pending')
      table.string('payment_status', 24).notNullable().defaultTo('unpaid')
      table.string('currency', 3).notNullable()
      table.bigInteger('total_minor').notNullable()
      table.string('customer_name', 120).notNullable()
      table.string('customer_email', 254).notNullable()
      table.string('customer_phone', 40).notNullable()
      table.text('delivery_address').notNullable()
      table.text('note').notNullable().defaultTo('')
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).nullable()
      table.timestamp('cancelled_at', { useTz: true }).nullable()
      table.check("status IN ('pending','processing','shipped','completed','cancelled')")
      table.check("payment_status IN ('unpaid','paid','refunded')")
      table.check('total_minor >= 0 AND total_minor <= 9007199254740991')
      table.check("currency ~ '^[A-Z]{3}$'")
      table.index(['customer_id', 'id'])
    })
    this.schema.createTable('order_items', (table) => {
      table.increments('id')
      table.integer('order_id').notNullable().references('orders.id').onDelete('RESTRICT')
      table.integer('product_id').nullable().references('products.id').onDelete('SET NULL')
      table
        .integer('product_variant_id')
        .nullable()
        .references('product_variants.id')
        .onDelete('SET NULL')
      table.string('product_name', 200).notNullable()
      table.text('variant_description').notNullable()
      table.string('sku', 120).notNullable()
      table.bigInteger('unit_price_minor').notNullable()
      table.integer('quantity').notNullable()
      table.bigInteger('discount_minor').notNullable().defaultTo(0)
      table.bigInteger('tax_minor').notNullable().defaultTo(0)
      table.check(
        'quantity > 0 AND unit_price_minor >= 0 AND discount_minor >= 0 AND tax_minor >= 0'
      )
      table.check(
        'unit_price_minor <= 9007199254740991 AND discount_minor <= 9007199254740991 AND tax_minor <= 9007199254740991'
      )
      table.index(['order_id'])
    })
    this.schema.createTable('customer_addresses', (table) => {
      table.increments('id')
      table.integer('customer_id').notNullable().references('users.id').onDelete('CASCADE')
      table.string('label', 80).notNullable()
      table.string('recipient', 120).notNullable()
      table.string('phone', 40).notNullable()
      table.text('address').notNullable()
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).nullable()
      table.index(['customer_id'])
    })
  }
  async down() {
    this.schema.dropTable('customer_addresses')
    this.schema.dropTable('order_items')
    this.schema.dropTable('orders')
    this.schema.alterTable('store_settings', (table) => table.dropColumn('guest_checkout_enabled'))
  }
}
