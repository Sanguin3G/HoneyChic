import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'
export default class Payment extends BaseModel {
  @column({ isPrimary: true }) declare id: number
  @column() declare publicId: string
  @column() declare orderId: number
  @column() declare method: 'cod' | 'fake'
  @column() declare status: 'pending' | 'paid'
  @column() declare currency: string
  @column({ consume: Number }) declare amountMinor: number
  @column.dateTime() declare paidAt: DateTime | null
}
