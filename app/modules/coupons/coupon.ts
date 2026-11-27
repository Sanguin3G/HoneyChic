import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'
export default class Coupon extends BaseModel {
  @column({ isPrimary: true }) declare id: number
  @column() declare code: string
  @column() declare kind: 'fixed' | 'percentage'
  @column() declare currency: string
  @column({ consume: Number }) declare value: number
  @column({ consume: Number }) declare minimumMinor: number
  @column.dateTime() declare startsAt: DateTime | null
  @column.dateTime() declare endsAt: DateTime | null
  @column() declare usageLimit: number | null
  @column() declare uses: number
  @column() declare isActive: boolean
}
