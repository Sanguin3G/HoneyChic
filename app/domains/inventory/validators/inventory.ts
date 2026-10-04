import vine from '@vinejs/vine'
import { manualReasons, maximumStock } from '#domains/inventory/data/movement_reasons'
export const inventoryAdjustmentValidator = vine.create({
  quantityDelta: vine.number().withoutDecimals().min(-maximumStock).max(maximumStock),
  reason: vine.enum(manualReasons),
  reference: vine.string().trim().maxLength(200).nullable(),
  note: vine.string().maxLength(500).nullable(),
})
export const inventoryQueryValidator = vine.create({
  q: vine.string().trim().maxLength(200).optional(),
  state: vine.enum(['all', 'low', 'out', 'retired']).optional(),
  page: vine.number().withoutDecimals().min(1).max(100000).optional(),
})

export const inventoryVariantValidator = vine.create({
  id: vine.number().withoutDecimals().min(1).max(maximumStock),
})
