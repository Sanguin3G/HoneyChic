import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'
export default class CustomerAddress extends BaseModel {
  @column({ isPrimary: true }) declare id: number
  @column() declare customerId: number
  @column() declare label: string
  @column() declare recipient: string
  @column() declare phone: string
  @column() declare address: string
  @column.dateTime({ autoCreate: true }) declare createdAt: DateTime
  @column.dateTime({ autoCreate: true, autoUpdate: true }) declare updatedAt: DateTime | null
}
