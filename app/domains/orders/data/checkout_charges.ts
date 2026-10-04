import type { TransactionClientContract } from '@adonisjs/lucid/types/database'
import type Order from '#domains/orders/models/order'
export interface CheckoutCharges {
  discountMinor: number
  shippingMinor: number
  shippingName: string
  couponCode: string
}
/** The application adapter participates in the order transaction; domains import no modules. */
export interface CheckoutParticipation {
  quote(
    subtotal: number,
    currency: string,
    trx: TransactionClientContract
  ): Promise<CheckoutCharges>
  created(order: Order, trx: TransactionClientContract): Promise<void>
}
