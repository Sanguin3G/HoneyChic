import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class ProductImage extends BaseModel {
  @column({ isPrimary: true }) declare id: number
  @column() declare productId: number
  @column() declare storageKey: string
  @column() declare altText: string
  @column() declare sortOrder: number
  @column() declare isPrimary: boolean
}
