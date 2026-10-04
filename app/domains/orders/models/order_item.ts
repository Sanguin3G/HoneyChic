import { BaseModel, column } from '@adonisjs/lucid/orm'
export default class OrderItem extends BaseModel {
  @column({ isPrimary: true }) declare id: number
  @column() declare orderId: number
  @column() declare productId: number | null
  @column() declare productVariantId: number | null
  @column() declare productName: string
  @column() declare variantDescription: string
  @column() declare sku: string
  @column({ consume: Number }) declare unitPriceMinor: number
  @column() declare quantity: number
  @column({ consume: Number }) declare discountMinor: number
  @column({ consume: Number }) declare taxMinor: number
}
