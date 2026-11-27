import type Order from '#domains/orders/models/order'
import type { CapabilityName } from '#core/capabilities/capabilities'

/**
 * A payment method a shop can offer. Adding one (Stripe, VNPay, bank transfer...) means:
 * a class here, an entry in `paymentProviders`, a capability flag, and EN/VI copy.
 * Real gateways must verify the provider's signature before calling SettlePayment.
 */
export interface PaymentProvider {
  readonly capability: CapabilityName
  permitsSettlement(order: Order, administrator: boolean): boolean
}
