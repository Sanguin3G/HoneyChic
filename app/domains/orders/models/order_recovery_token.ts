import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class OrderRecoveryToken extends BaseModel {
  static selfAssignPrimaryKey = true
  @column({ isPrimary: true }) declare id: string
  @column() declare orderId: number
  @column() declare tokenHash: string
  @column.dateTime() declare expiresAt: DateTime
  @column.dateTime({ autoCreate: true }) declare createdAt: DateTime
}
