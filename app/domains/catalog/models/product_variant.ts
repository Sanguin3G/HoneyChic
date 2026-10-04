import { DateTime } from 'luxon'
import { BaseModel, column, manyToMany, belongsTo } from '@adonisjs/lucid/orm'
import type { ManyToMany, BelongsTo } from '@adonisjs/lucid/types/relations'
import Product from '#domains/catalog/models/product'
import ProductOptionValue from '#domains/catalog/models/product_option_value'

export default class ProductVariant extends BaseModel {
  @column({ isPrimary: true }) declare id: number
  @column() declare productId: number
  @column() declare sku: string
  @column({ consume: (value) => Number(value) }) declare priceMinor: number
  @column() declare currency: string
  @column() declare stock: number
  @belongsTo(() => Product) declare product: BelongsTo<typeof Product>
  @column() declare description: string
  @column() declare combinationKey: string
  @column() declare isActive: boolean
  @column.dateTime({ autoCreate: true }) declare createdAt: DateTime
  @column.dateTime({ autoCreate: true, autoUpdate: true }) declare updatedAt: DateTime
  @manyToMany(() => ProductOptionValue, {
    pivotTable: 'product_variant_option_values',
    pivotForeignKey: 'product_variant_id',
    pivotRelatedForeignKey: 'product_option_value_id',
  })
  declare optionValues: ManyToMany<typeof ProductOptionValue>
}
