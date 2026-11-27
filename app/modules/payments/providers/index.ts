import CashOnDelivery from './cash_on_delivery.js'
import FakePaymentGateway from './fake_payment_gateway.js'
import type { PaymentProvider } from './payment_provider.js'

/** Every installed payment method, keyed by the value stored in `payments.method`. */
export const paymentProviders = {
  cod: new CashOnDelivery(),
  fake: new FakePaymentGateway(),
} satisfies Record<string, PaymentProvider>

export type PaymentMethod = keyof typeof paymentProviders
export const paymentMethods = Object.keys(paymentProviders) as PaymentMethod[]
