import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'
import type { Locale } from '#core/support/locale'

export default class StoreSetting extends BaseModel {
  @column({ isPrimary: true }) declare id: number
  @column() declare name: string
  @column() declare description: string
  @column() declare email: string | null
  @column() declare phone: string | null
  @column() declare address: string
  @column() declare currency: string
  @column() declare defaultLocale: Locale
  @column() declare timezone: string
  @column() declare orderPrefix: string
  @column() declare lowStockThreshold: number
  @column() declare customerAccountsEnabled: boolean
  @column() declare registrationEnabled: boolean
  @column() declare guestCheckoutEnabled: boolean
  @column() declare reviewsEnabled: boolean
  @column() declare wishlistEnabled: boolean
  @column() declare couponsEnabled: boolean
  @column() declare shippingEnabled: boolean
  @column() declare codEnabled: boolean
  @column() declare fakePaymentEnabled: boolean
  @column.dateTime({ autoCreate: true }) declare createdAt: DateTime
  @column.dateTime({ autoCreate: true, autoUpdate: true }) declare updatedAt: DateTime | null
}
