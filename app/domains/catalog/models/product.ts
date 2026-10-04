import { DateTime } from 'luxon'
import { BaseModel, column, hasMany, belongsTo } from '@adonisjs/lucid/orm'
import type { HasMany, BelongsTo } from '@adonisjs/lucid/types/relations'
import Category from '#domains/catalog/models/category'
import ProductVariant from '#domains/catalog/models/product_variant'
import ProductOption from '#domains/catalog/models/product_option'
import ProductImage from '#domains/catalog/models/product_image'

export default class Product extends BaseModel {
  @column({ isPrimary: true }) declare id: number
  @column() declare categoryId: number | null
  @column() declare name: string
  @column() declare slug: string
  @column() declare description: string
  @column() declare status: 'draft' | 'published' | 'archived'
  @column.dateTime({ autoCreate: true }) declare createdAt: DateTime
  @column.dateTime({ autoCreate: true, autoUpdate: true }) declare updatedAt: DateTime
  @belongsTo(() => Category) declare category: BelongsTo<typeof Category>
  @hasMany(() => ProductVariant) declare variants: HasMany<typeof ProductVariant>
  @hasMany(() => ProductOption) declare options: HasMany<typeof ProductOption>
  @hasMany(() => ProductImage) declare images: HasMany<typeof ProductImage>
}
