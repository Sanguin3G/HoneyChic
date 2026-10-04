export const movementReasons = [
  'initial_stock',
  'sale',
  'cancellation',
  'manual_adjustment',
  'restock',
  'return',
  'correction',
] as const
export type MovementReason = (typeof movementReasons)[number]
export const manualReasons = [
  'initial_stock',
  'manual_adjustment',
  'restock',
  'correction',
] as const
export const maximumStock = 2_147_483_647
