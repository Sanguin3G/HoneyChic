import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.alterTable('store_settings', (table) => {
      // Null means unpaid orders never expire.
      table.integer('unpaid_order_hours').nullable()
    })
    this.schema.raw(
      'alter table store_settings add constraint store_settings_unpaid_order_hours_check check (unpaid_order_hours is null or unpaid_order_hours between 1 and 720)'
    )
  }

  async down() {
    this.schema.raw(
      'alter table store_settings drop constraint if exists store_settings_unpaid_order_hours_check'
    )
    this.schema.alterTable('store_settings', (table) => {
      table.dropColumn('unpaid_order_hours')
    })
  }
}
