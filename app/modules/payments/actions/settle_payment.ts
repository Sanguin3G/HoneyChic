import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import Order from '#domains/orders/models/order'
import Payment from '#modules/payments/models/payment'
import CashOnDelivery from '#modules/payments/providers/cash_on_delivery'
import FakePaymentGateway from '#modules/payments/providers/fake_payment_gateway'
import { requireCapability, rejectModule } from '#modules/support/require_capability'
import type { Locale } from '#core/support/locale'
export default class SettlePayment {
  /** Caller authenticates callback/actor. Amount/currency/reference are checked again under locks. */
  async execute(
    publicId: string,
    event: { reference: string; amountMinor: number; currency: string },
    actor: { customerId: number | null; guestOrder?: string; administrator: boolean },
    locale: Locale
  ) {
    return db.transaction(async (trx) => {
      const initial = await Payment.query({ client: trx }).where('publicId', publicId).firstOrFail()
      // Matches cancellation's order-first lock, so payment and cancellation cannot race.
      const order = await Order.query({ client: trx })
        .where('id', initial.orderId)
        .forUpdate()
        .firstOrFail()
      const payment = await Payment.query({ client: trx })
        .where('id', initial.id)
        .forUpdate()
        .firstOrFail()
      if (
        !actor.administrator &&
        !(
          (order.customerId !== null && order.customerId === actor.customerId) ||
          (order.customerId === null && actor.guestOrder === order.publicId)
        )
      )
        rejectModule('paymentDenied', locale)
      if (
        payment.amountMinor !== order.totalMinor ||
        payment.currency !== order.currency ||
        event.amountMinor !== payment.amountMinor ||
        event.currency !== payment.currency ||
        !event.reference ||
        event.reference.length > 100
      )
        rejectModule('paymentMismatch', locale)
      const previous = await trx.from('payment_events').where('reference', event.reference).first()
      if (previous) {
        if (previous.payment_id !== payment.id) rejectModule('paymentMismatch', locale)
        return payment
      }
      if (payment.status === 'paid') return payment
      await requireCapability(
        payment.method === 'cod' ? 'payments.cod' : 'payments.fake',
        locale,
        trx
      )
      const provider = payment.method === 'cod' ? new CashOnDelivery() : new FakePaymentGateway()
      if (
        !provider.permitsSettlement(order, actor.administrator) ||
        order.paymentStatus !== 'unpaid'
      )
        rejectModule('paymentDenied', locale)
      await trx
        .table('payment_events')
        .insert({ payment_id: payment.id, reference: event.reference })
      await payment.merge({ status: 'paid', paidAt: DateTime.utc() }).save()
      await order.merge({ paymentStatus: 'paid' }).save()
      return payment
    })
  }
}
