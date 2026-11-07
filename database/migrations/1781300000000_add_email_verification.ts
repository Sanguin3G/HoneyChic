import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.alterTable('users', (table) => {
      table.boolean('requires_email_verification').notNullable().defaultTo(false)
      table.timestamp('email_verified_at', { useTz: true }).nullable()
    })
    this.schema.createTable('email_verification_tokens', (table) => {
      table.uuid('id').primary()
      table.integer('user_id').notNullable().references('users.id').onDelete('CASCADE')
      table.text('token_hash').notNullable()
      table.timestamp('expires_at', { useTz: true }).notNullable()
      table.timestamp('used_at', { useTz: true }).nullable()
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.index(['user_id'])
    })
  }

  async down() {
    this.schema.dropTable('email_verification_tokens')
    this.schema.alterTable('users', (table) => {
      table.dropColumn('requires_email_verification')
      table.dropColumn('email_verified_at')
    })
  }
}
