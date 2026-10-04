import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.createTable('users', (table) => {
      table.increments('id')
      table.string('full_name', 120).notNullable()
      table.string('email', 254).notNullable().unique()
      table.string('password').notNullable()
      table.string('role', 20).notNullable().defaultTo('customer')
      table.string('preferred_locale', 2).nullable()
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).nullable()
      table.check("role IN ('owner', 'staff', 'customer')")
      table.check("preferred_locale IS NULL OR preferred_locale IN ('en', 'vi')")
      table.check('email = lower(email)')
    })
  }

  async down() {
    this.schema.dropTable('users')
  }
}
