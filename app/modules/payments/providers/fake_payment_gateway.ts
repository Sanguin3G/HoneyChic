import env from '#start/env'
import type Order from '#domains/orders/models/order'
import type { PaymentProvider } from './payment_provider.js'
export default class FakePaymentGateway implements PaymentProvider {
  readonly method = 'fake'
  permitsSettlement(order: Order) {
    return env.get('NODE_ENV') !== 'production' && ['pending', 'processing'].includes(order.status)
  }
}
