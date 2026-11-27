import { DateTime } from 'luxon'
import logger from '@adonisjs/core/services/logger'
import StoreSetting from '#core/store/store_setting'
import Order from '#domains/orders/models/order'
import CancelOrder from '#domains/orders/actions/cancel_order'
import type { Locale } from '#core/support/locale'
import DeliverOrderMail from '#domains/orders/actions/deliver_order_mail'

/**
 * Cancels pending unpaid orders older than the merchant's lifetime through CancelOrder,
 * so stock is restored exactly once. Orders paid, processed or returned in the meantime
 * are rejected under CancelOrder's lock and skipped. Mail goes out after each commit.
 */
export default class ExpireUnpaidOrders {
  async execute(now = DateTime.utc()) {
    const store = await StoreSetting.findOrFail(1)
    if (!store.unpaidOrderHours) return []
    const cutoff = now.minus({ hours: store.unpaidOrderHours })
    const candidates = await Order.query()
      .where('status', 'pending')
      .where('paymentStatus', 'unpaid')
      .where('createdAt', '<', cutoff.toSQL()!)
      .orderBy('id')
      .limit(200)
    const expired: Order[] = []
    for (const candidate of candidates) {
      const locale: Locale = candidate.locale === 'vi' ? 'vi' : 'en'
      const started = DateTime.utc()
      try {
        const order = await new CancelOrder().execute(
          candidate.publicId,
          { id: null, admin: true },
          locale
        )
        // CancelOrder returns an order someone else already cancelled unchanged.
        if (!order.cancelledAt || order.cancelledAt < started) continue
        expired.push(order)
        await new DeliverOrderMail().execute(order, 'cancelled')
      } catch {
        logger.info({ order: candidate.publicId }, 'unpaid order changed before expiry; skipped')
      }
    }
    return expired
  }
}
