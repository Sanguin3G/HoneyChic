import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.createTable('categories', (table) => {
      table.increments('id')
      table.string('name', 120).notNullable()
      table.string('slug', 140).notNullable().unique()
      table.text('description').notNullable().defaultTo('')
      table.boolean('is_active').notNullable().defaultTo(true)
      table.timestamps(true, true)
    })
    this.schema.createTable('products', (table) => {
      table.increments('id')
      table.integer('category_id').nullable().references('categories.id').onDelete('RESTRICT')
      table.string('name', 180).notNullable()
      table.string('slug', 200).notNullable().unique()
      table.text('description').notNullable().defaultTo('')
      table.string('status', 16).notNullable().defaultTo('draft')
      table.timestamps(true, true)
      table.check("status IN ('draft', 'published', 'archived')")
      table.index(['status', 'category_id'])
    })
    this.schema.raw(`ALTER TABLE products ADD COLUMN search_document tsvector
      GENERATED ALWAYS AS (to_tsvector('simple', coalesce(name, '') || ' ' || coalesce(description, ''))) STORED`)
    this.schema.raw('CREATE INDEX products_search_idx ON products USING GIN (search_document)')
    this.schema.createTable('product_variants', (table) => {
      table.increments('id')
      table.integer('product_id').notNullable().references('products.id').onDelete('RESTRICT')
      table.string('sku', 80).notNullable().unique()
      table.bigint('price_minor').notNullable()
      table.string('currency', 3).notNullable()
      table.string('description', 500).notNullable().defaultTo('')
      table.text('combination_key').notNullable()
      table.boolean('is_active').notNullable().defaultTo(true)
      table.timestamps(true, true)
      table.check('price_minor >= 0 AND price_minor <= 9007199254740991')
      table.check("currency ~ '^[A-Z]{3}$'")
      table.index(['product_id', 'is_active'])
    })
    this.schema.raw(`CREATE UNIQUE INDEX product_variants_active_combination_idx
      ON product_variants (product_id, combination_key) WHERE is_active`)
    this.schema.createTable('product_options', (table) => {
      table.increments('id')
      table.integer('product_id').notNullable().references('products.id').onDelete('RESTRICT')
      table.string('name', 80).notNullable()
      table.integer('sort_order').notNullable()
      table.unique(['product_id', 'name'])
    })
    this.schema.createTable('product_option_values', (table) => {
      table.increments('id')
      table
        .integer('product_option_id')
        .notNullable()
        .references('product_options.id')
        .onDelete('CASCADE')
      table.string('value', 80).notNullable()
      table.integer('sort_order').notNullable()
      table.unique(['product_option_id', 'value'])
    })
    this.schema.createTable('product_variant_option_values', (table) => {
      table
        .integer('product_variant_id')
        .notNullable()
        .references('product_variants.id')
        .onDelete('CASCADE')
      table
        .integer('product_option_value_id')
        .notNullable()
        .references('product_option_values.id')
        .onDelete('CASCADE')
      table.primary(['product_variant_id', 'product_option_value_id'])
    })
    this.schema.createTable('product_images', (table) => {
      table.increments('id')
      table.integer('product_id').notNullable().references('products.id').onDelete('RESTRICT')
      table.string('storage_key', 255).notNullable()
      table.string('alt_text', 200).notNullable()
      table.integer('sort_order').notNullable()
      table.boolean('is_primary').notNullable()
      table.check('sort_order >= 0')
    })
    this.schema.raw(
      'CREATE UNIQUE INDEX product_images_primary_idx ON product_images (product_id) WHERE is_primary'
    )
  }

  async down() {
    for (const table of [
      'product_images',
      'product_variant_option_values',
      'product_option_values',
      'product_options',
      'product_variants',
      'products',
      'categories',
    ])
      this.schema.dropTable(table)
  }
}
