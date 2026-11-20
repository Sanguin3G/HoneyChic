import db from '@adonisjs/lucid/services/db'
import Order from '#domains/orders/models/order'
import OrderRefund from '#domains/orders/models/order_refund'
import { rejectOrder } from '#domains/orders/errors/reject_order'
import type { Locale } from '#core/support/locale'

export default class RecordRefund {
  async execute(
    publicId: string,
    input: { amountMinor: number; reference: string; note?: string | null },
    actor: { id: number | null; admin: boolean },
    locale: Locale
  ) {
    if (!actor.admin || !actor.id) rejectOrder('forbidden', locale)
    const reference = input.reference.trim()
    if (
      !reference ||
      reference.length > 100 ||
      !Number.isSafeInteger(input.amountMinor) ||
      input.amountMinor < 1
    ) {
      rejectOrder('invalidRefund', locale)
    }
    return db.transaction(async (trx) => {
      const order = await Order.query({ client: trx })
        .where('publicId', publicId)
        .forUpdate()
        .firstOrFail()
      const existing = await OrderRefund.query({ client: trx })
        .where('orderId', order.id)
        .where('reference', reference)
        .first()
      if (existing) return existing
      if (order.status === 'cancelled' || order.paymentStatus !== 'paid') {
        rejectOrder('cannotRefund', locale)
      }
      const refunds = await OrderRefund.query({ client: trx }).where('orderId', order.id)
      const refundedMinor = refunds.reduce((sum, row) => sum + BigInt(row.amountMinor), 0n)
      const remaining = BigInt(order.totalMinor) - refundedMinor
      if (BigInt(input.amountMinor) > remaining) {
        rejectOrder('invalidRefund', locale)
      }
      const refund = await OrderRefund.create(
        {
          orderId: order.id,
          actorId: actor.id,
          amountMinor: input.amountMinor,
          reference,
          note: input.note?.trim() ?? '',
        },
        { client: trx }
      )
      if (refundedMinor + BigInt(input.amountMinor) === BigInt(order.totalMinor)) {
        await order.merge({ paymentStatus: 'refunded' }).save()
      }
      return refund
    })
  }
}
