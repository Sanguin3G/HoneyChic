import { BaseModel, column } from '@adonisjs/lucid/orm'
export default class ShippingRate extends BaseModel {
  @column({ isPrimary: true }) declare id: number
  @column() declare name: string
  @column() declare kind: 'pickup' | 'flat'
  @column() declare currency: string
  @column({ consume: Number }) declare amountMinor: number
  @column({ consume: (value: unknown) => (value === null ? null : Number(value)) })
  declare freeAboveMinor: number | null
  @column({ prepare: (value: string[]) => JSON.stringify(value) }) declare countries: string[]
  @column() declare isActive: boolean
}
