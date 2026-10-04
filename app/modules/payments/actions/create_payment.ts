import { randomUUID } from 'node:crypto'
import Payment from '#modules/payments/models/payment'
import type Order from '#domains/orders/models/order'
import { requireCapability } from '#modules/support/require_capability'
import type { Locale } from '#core/support/locale'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'
export default class CreatePayment {
  async execute(
    order: Order,
    method: 'cod' | 'fake',
    locale: Locale,
    trx: TransactionClientContract
  ) {
    await requireCapability(method === 'cod' ? 'payments.cod' : 'payments.fake', locale, trx)
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
