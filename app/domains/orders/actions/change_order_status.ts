import db from '@adonisjs/lucid/services/db'
import Order from '#domains/orders/models/order'
import CancelOrder from './cancel_order.js'
import { orderTransitions, type OrderStatus } from '#domains/orders/data/order_states'
import { rejectOrder } from '#domains/orders/errors/reject_order'
import type { Locale } from '#core/support/locale'
export default class ChangeOrderStatus {
  async execute(publicId: string, status: OrderStatus, actorId: number, locale: Locale) {
    if (status === 'cancelled')
      return new CancelOrder().execute(publicId, { id: actorId, admin: true }, locale)
    return db.transaction(async (trx) => {
      const order = await Order.query({ client: trx })
        .where('publicId', publicId)
        .forUpdate()
        .firstOrFail()
      if (order.status === status) return order
      if (!orderTransitions[order.status].includes(status)) rejectOrder('invalidTransition', locale)
      return order.merge({ status }).save()
    })
  }
}
