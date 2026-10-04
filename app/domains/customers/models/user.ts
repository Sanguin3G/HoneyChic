import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, column } from '@adonisjs/lucid/orm'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import type { Locale } from '#core/support/locale'

export type UserRole = 'owner' | 'staff' | 'customer'

export default class User extends compose(BaseModel, withAuthFinder(hash)) {
  @column({ isPrimary: true }) declare id: number
  @column() declare fullName: string
  @column() declare email: string
  @column({ serializeAs: null }) declare password: string
  @column() declare role: UserRole
  @column() declare preferredLocale: Locale | null
  @column.dateTime({ autoCreate: true }) declare createdAt: DateTime
  @column.dateTime({ autoCreate: true, autoUpdate: true }) declare updatedAt: DateTime | null
}
