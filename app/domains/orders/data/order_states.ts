export const orderStatuses = ['pending', 'processing', 'shipped', 'completed', 'cancelled'] as const
export type OrderStatus = (typeof orderStatuses)[number]
export const orderTransitions: Record<OrderStatus, OrderStatus[]> = {
  pending: ['processing', 'cancelled'],
  processing: ['shipped', 'completed', 'cancelled'],
  shipped: ['completed'],
  completed: [],
  cancelled: [],
}
