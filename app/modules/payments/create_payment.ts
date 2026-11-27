import { randomUUID } from 'node:crypto'
import Payment from '#modules/payments/payment'
import type Order from '#domains/orders/models/order'
import { requireCapability } from '#modules/require_capability'
import { paymentProviders, type PaymentMethod } from '#modules/payments/providers/index'
import type { Locale } from '#core/support/locale'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'
export default class CreatePayment {
  async execute(
    order: Order,
    method: PaymentMethod,
    locale: Locale,
    trx: TransactionClientContract
  ) {
    await requireCapability(paymentProviders[method].capability, locale, trx)
    return Payment.create(
      {
        publicId: randomUUID(),
        orderId: order.id,
        method,
        status: 'pending',
        currency: order.currency,
        amountMinor: order.totalMinor,
      },
      { client: trx }
    )
  }
}
