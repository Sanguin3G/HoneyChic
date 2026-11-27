import type Order from '#domains/orders/models/order'
import type { PaymentProvider } from './payment_provider.js'
export default class CashOnDelivery implements PaymentProvider {
  readonly capability = 'payments.cod' as const
  permitsSettlement(order: Order, administrator: boolean) {
    return administrator && ['processing', 'shipped', 'completed'].includes(order.status)
  }
}
