import type Order from '#domains/orders/models/order'
import type { PaymentProvider } from './payment_provider.js'
export default class CashOnDelivery implements PaymentProvider {
  readonly method = 'cod'
  permitsSettlement(order: Order, administrator: boolean) {
    return administrator && ['processing', 'shipped', 'completed'].includes(order.status)
  }
}
