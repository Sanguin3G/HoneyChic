import { BaseSchema } from '@adonisjs/lucid/schema'
export default class extends BaseSchema {
  async up() {
    this.schema.alterTable('store_settings', (table) => {
      for (const name of ['reviews', 'wishlist', 'coupons', 'shipping', 'cod', 'fake_payment'])
        table
          .boolean(name + '_enabled')
          .notNullable()
          .defaultTo(false)
    })
    this.schema.alterTable('orders', (table) => {
      table.bigInteger('discount_minor').notNullable().defaultTo(0)
      table.bigInteger('shipping_minor').notNullable().defaultTo(0)
      table.string('shipping_name', 120).notNullable().defaultTo('')
      table.string('coupon_code', 40).notNullable().defaultTo('')
      table.check(
        'discount_minor >= 0 AND discount_minor <= 9007199254740991',
        [],
        'orders_discount_range'
      )
      table.check(
        'shipping_minor >= 0 AND shipping_minor <= 9007199254740991',
        [],
        'orders_shipping_range'
      )
    })
    this.schema.createTable('wishlists', (table) => {
      table.increments('id')
      table.integer('customer_id').notNullable().references('users.id').onDelete('CASCADE')
      table.integer('product_id').notNullable().references('products.id').onDelete('CASCADE')
      table.unique(['customer_id', 'product_id'])
    })
    this.schema.createTable('reviews', (table) => {
      table.increments('id')
      table.integer('customer_id').notNullable().references('users.id').onDelete('CASCADE')
      table.integer('product_id').notNullable().references('products.id').onDelete('CASCADE')
      table.integer('rating').notNullable()
      table.text('body').notNullable()
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).nullable()
      table.unique(['customer_id', 'product_id'])
      table.check('rating BETWEEN 1 AND 5')
    })
    this.schema.createTable('shipping_rates', (table) => {
      table.increments('id')
      table.string('name', 120).notNullable()
      table.string('kind', 20).notNullable()
      table.string('currency', 3).notNullable()
      table.bigInteger('amount_minor').notNullable()
      table.bigInteger('free_above_minor').nullable()
      table.jsonb('countries').notNullable().defaultTo('[]')
      table.boolean('is_active').notNullable().defaultTo(true)
      table.check("kind IN ('pickup','flat')")
      table.check("currency ~ '^[A-Z]{3}$'")
      table.check('amount_minor BETWEEN 0 AND 9007199254740991')
      table.check('free_above_minor IS NULL OR free_above_minor BETWEEN 0 AND 9007199254740991')
    })
    this.schema.createTable('coupons', (table) => {
      table.increments('id')
      table.string('code', 40).notNullable().unique()
      table.string('kind', 20).notNullable()
      table.string('currency', 3).notNullable()
      table.bigInteger('value').notNullable()
      table.bigInteger('minimum_minor').notNullable().defaultTo(0)
      table.timestamp('starts_at', { useTz: true }).nullable()
      table.timestamp('ends_at', { useTz: true }).nullable()
      table.integer('usage_limit').nullable()
      table.integer('uses').notNullable().defaultTo(0)
      table.boolean('is_active').notNullable().defaultTo(true)
      table.check("kind IN ('fixed','percentage')")
      table.check("currency ~ '^[A-Z]{3}$'")
      table.check(
        'value BETWEEN 0 AND 9007199254740991 AND minimum_minor BETWEEN 0 AND 9007199254740991'
      )
      table.check("kind <> 'percentage' OR value BETWEEN 1 AND 10000")
      table.check(
        'uses >= 0 AND (usage_limit IS NULL OR (usage_limit > 0 AND uses <= usage_limit))'
      )
      table.check('starts_at IS NULL OR ends_at IS NULL OR starts_at < ends_at')
    })
    this.schema.createTable('coupon_redemptions', (table) => {
      table.increments('id')
      table.integer('coupon_id').notNullable().references('coupons.id').onDelete('RESTRICT')
      table.integer('order_id').notNullable().unique().references('orders.id').onDelete('RESTRICT')
    })
    this.schema.createTable('payments', (table) => {
      table.increments('id')
      table.uuid('public_id').notNullable().unique()
      table.integer('order_id').notNullable().unique().references('orders.id').onDelete('RESTRICT')
      table.string('method', 20).notNullable()
      table.string('status', 20).notNullable().defaultTo('pending')
      table.string('currency', 3).notNullable()
      table.bigInteger('amount_minor').notNullable()
      table.timestamp('paid_at', { useTz: true }).nullable()
      table.check("method IN ('cod','fake')")
      table.check("status IN ('pending','paid')")
      table.check('amount_minor BETWEEN 0 AND 9007199254740991')
    })
    this.schema.createTable('payment_events', (table) => {
      table.increments('id')
      table.integer('payment_id').notNullable().references('payments.id').onDelete('RESTRICT')
      table.string('reference', 100).notNullable().unique()
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
    })
  }
  async down() {
    for (const name of [
      'payment_events',
      'payments',
      'coupon_redemptions',
      'coupons',
      'shipping_rates',
      'reviews',
      'wishlists',
    ])
      this.schema.dropTable(name)
    this.schema.alterTable('orders', (table) => {
      for (const name of ['discount_minor', 'shipping_minor', 'shipping_name', 'coupon_code'])
        table.dropColumn(name)
    })
    this.schema.alterTable('store_settings', (table) => {
      for (const name of ['reviews', 'wishlist', 'coupons', 'shipping', 'cod', 'fake_payment'])
        table.dropColumn(name + '_enabled')
    })
  }
}
