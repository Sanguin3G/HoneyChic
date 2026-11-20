import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class OrderRefund extends BaseModel {
  @column({ isPrimary: true }) declare id: number
  @column() declare orderId: number
  @column() declare actorId: number | null
  @column({ consume: Number }) declare amountMinor: number
  @column() declare reference: string
  @column() declare note: string
  @column.dateTime({ autoCreate: true }) declare createdAt: DateTime
}
