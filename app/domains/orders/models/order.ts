import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import OrderItem from './order_item.js'
import type { OrderStatus } from '#domains/orders/data/order_states'
export default class Order extends BaseModel {
  @column({ isPrimary: true }) declare id: number
  @column() declare publicId: string
  @column({ serializeAs: null }) declare checkoutKey: string
  @column() declare number: string
  @column() declare customerId: number | null
  @column() declare status: OrderStatus
  @column() declare paymentStatus: 'unpaid' | 'paid' | 'refunded'
  @column() declare currency: string
  @column({ consume: Number }) declare totalMinor: number
  @column({ consume: Number }) declare discountMinor: number
  @column({ consume: Number }) declare shippingMinor: number
  @column() declare shippingName: string
  @column() declare couponCode: string
  @column() declare customerName: string
  @column() declare customerEmail: string
  @column() declare customerPhone: string
  @column() declare deliveryAddress: string
  @column() declare note: string
  @column.dateTime({ autoCreate: true }) declare createdAt: DateTime
  @column.dateTime({ autoCreate: true, autoUpdate: true }) declare updatedAt: DateTime | null
  @column.dateTime() declare cancelledAt: DateTime | null
  @hasMany(() => OrderItem) declare items: HasMany<typeof OrderItem>
}
