import { decimalPrice } from '#shared/money'
import type Order from '#domains/orders/models/order'

const columns = ['number', 'created_at', 'customer', 'status', 'payment', 'currency', 'total']

function cell(value: string) {
  const guarded = /^[=+\-@\t\r]/.test(value) ? "'" + value : value
  if (/[",\n\r]/.test(guarded)) return '"' + guarded.replaceAll('"', '""') + '"'
  return guarded
}

export function ordersCsv(orders: Order[], timezone: string) {
  const lines = [columns.join(',')]
  for (const order of orders) {
    const zoned = order.createdAt.setZone(timezone)
    const created = (zoned.isValid ? zoned : order.createdAt).toISO() ?? ''
    lines.push(
      [
        order.number,
        created,
        order.customerName,
        order.status,
        order.paymentStatus,
        order.currency,
        decimalPrice(order.totalMinor, order.currency),
      ]
        .map(cell)
        .join(',')
    )
  }
  return '\uFEFF' + lines.join('\n') + '\n'
}

export function orderExportLimit() {
  return 5000
}
