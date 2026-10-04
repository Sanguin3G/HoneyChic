import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class ProductOptionValue extends BaseModel {
  @column({ isPrimary: true }) declare id: number
  @column() declare productOptionId: number
  @column() declare value: string
  @column() declare sortOrder: number
}
