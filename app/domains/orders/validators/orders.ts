import vine from '@vinejs/vine'
import { orderStatuses } from '#domains/orders/data/order_states'
export const checkoutValidator = vine.create({
  token: vine.string().uuid(),
  customerName: vine.string().trim().minLength(1).maxLength(120),
  customerEmail: vine.string().trim().toLowerCase().email().maxLength(254),
  customerPhone: vine.string().trim().minLength(1).maxLength(40),
  deliveryAddress: vine.string().trim().minLength(1).maxLength(1000),
  note: vine.string().trim().maxLength(2000).nullable().optional(),
  expectedTotalMinor: vine.number().withoutDecimals().min(0).max(Number.MAX_SAFE_INTEGER),
})
export const orderListValidator = vine.create({
  page: vine.number().withoutDecimals().min(1).max(1000000).optional(),
  status: vine.enum(orderStatuses).optional(),
  q: vine.string().trim().maxLength(120).optional(),
})
export const orderStatusValidator = vine.create({ status: vine.enum(orderStatuses) })

export const orderIdValidator = vine.create({ id: vine.string().uuid() })
