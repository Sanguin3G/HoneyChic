import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#domains/customers/models/user'
import type { MovementReason } from '#domains/inventory/data/movement_reasons'

export default class InventoryMovement extends BaseModel {
  @column({ isPrimary: true }) declare id: number
  @column() declare productVariantId: number
  @column() declare quantityDelta: number
  @column() declare stockAfter: number
  @column() declare reason: MovementReason
  @column() declare reference: string | null
  @column() declare note: string
  @column() declare actorId: number | null
  @column.dateTime({ autoCreate: true }) declare createdAt: DateTime
  @belongsTo(() => User, { foreignKey: 'actorId' }) declare actor: BelongsTo<typeof User>
}
