import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class PasswordResetToken extends BaseModel {
  static selfAssignPrimaryKey = true
  @column({ isPrimary: true }) declare id: string
  @column() declare userId: number
  @column() declare tokenHash: string
  @column.dateTime() declare expiresAt: DateTime
  @column.dateTime() declare usedAt: DateTime | null
  @column.dateTime({ autoCreate: true }) declare createdAt: DateTime
}
