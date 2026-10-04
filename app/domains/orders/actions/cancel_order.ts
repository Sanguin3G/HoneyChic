import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import Order from '#domains/orders/models/order'
import OrderItem from '#domains/orders/models/order_item'
import AdjustInventory from '#domains/inventory/actions/adjust_inventory'
import { rejectOrder } from '#domains/orders/errors/reject_order'
import type { Locale } from '#core/support/locale'
export default class CancelOrder {
  async execute(
    publicId: string,
    actor: { id: number | null; admin: boolean; guestOrder?: string },
    locale: Locale
  ) {
    return db.transaction(async (trx) => {
      const order = await Order.query({ client: trx })
        .where('publicId', publicId)
        .forUpdate()
        .firstOrFail()
      if (
        !actor.admin &&
        !(actor.id && order.customerId === actor.id) &&
        !(order.customerId === null && actor.guestOrder === order.publicId)
      ) {
        rejectOrder('forbidden', locale)
      }
      if (order.status === 'cancelled') return order
      const allowed = actor.admin ? ['pending', 'processing'] : ['pending']
      if (!allowed.includes(order.status) || order.paymentStatus !== 'unpaid')
        rejectOrder('cannotCancel', locale)
      const items = await OrderItem.query({ client: trx })
        .where('orderId', order.id)
        .orderBy('productVariantId')
      for (const item of items) {
        if (!item.productVariantId) rejectOrder('cannotCancel', locale)
        await new AdjustInventory().execute(
          {
            variantId: item.productVariantId,
            quantityDelta: item.quantity,
            reason: 'cancellation',
            reference: order.number,
            actorId: actor.id,
          },
          locale,
          trx
        )
      }
      return order.merge({ status: 'cancelled', cancelledAt: DateTime.utc() }).save()
    })
  }
}
