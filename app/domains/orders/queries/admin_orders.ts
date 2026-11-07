import Order from '#domains/orders/models/order'
import type { OrderStatus } from '#domains/orders/data/order_states'

export function adminOrders(input: { status?: OrderStatus; q?: string }) {
  const query = Order.query()
  if (input.status) query.where('status', input.status)
  if (input.q) {
    const term = '%' + input.q + '%'
    query.where((scope) =>
      scope
        .whereILike('number', term)
        .orWhereILike('customerName', term)
        .orWhereILike('customerEmail', term)
    )
  }
  return query
}
