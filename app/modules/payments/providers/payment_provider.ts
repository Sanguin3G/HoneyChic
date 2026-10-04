import type Order from '#domains/orders/models/order'
export interface PaymentProvider {
  readonly method: 'cod' | 'fake'
  permitsSettlement(order: Order, administrator: boolean): boolean
}
