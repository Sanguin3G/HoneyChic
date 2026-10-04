import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import ProductOptionValue from '#domains/catalog/models/product_option_value'

export default class ProductOption extends BaseModel {
  @column({ isPrimary: true }) declare id: number
  @column() declare productId: number
  @column() declare name: string
  @column() declare sortOrder: number
  @hasMany(() => ProductOptionValue) declare values: HasMany<typeof ProductOptionValue>
}
