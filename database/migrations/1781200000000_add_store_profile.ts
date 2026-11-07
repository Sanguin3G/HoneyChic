import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.alterTable('store_settings', (table) => {
      table.string('store_profile', 32).notNullable().defaultTo('custom')
    })
    // Knex invents a broken constraint name when a check contains quotes.
    this.schema.raw(
      "alter table store_settings add constraint store_settings_store_profile_check check (store_profile in ('simple_seller', 'standard_store', 'catalog_only', 'custom'))"
    )
  }

  async down() {
    this.schema.raw(
      'alter table store_settings drop constraint if exists store_settings_store_profile_check'
    )
    this.schema.alterTable('store_settings', (table) => {
      table.dropColumn('store_profile')
    })
  }
}
