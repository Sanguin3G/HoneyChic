import db from '@adonisjs/lucid/services/db'
import Order from '#domains/orders/models/order'
import { orderSummary } from '#domains/orders/data/order_data'
export async function adminDashboard(threshold: number) {
  const counts = await db.rawQuery(
    `SELECT
    (SELECT COUNT(*) FROM orders) AS orders,
    (SELECT COUNT(*) FROM orders WHERE status IN ('pending','processing')) AS open_orders,
    (SELECT COUNT(*) FROM products) AS products,
    (SELECT COUNT(*) FROM users WHERE role = 'customer') AS customers,
    (SELECT COUNT(*) FROM product_variants WHERE is_active AND stock > 0 AND stock <= ?) AS low_stock`,
    [threshold]
  )
  const totals =
    await db.rawQuery(`SELECT currency, COUNT(*) AS count, SUM(total_minor)::text AS amount
    FROM orders WHERE status <> 'cancelled' GROUP BY currency ORDER BY currency`)
  const top = await db.rawQuery(`SELECT oi.product_name AS name, o.currency,
    SUM(oi.quantity)::text AS quantity,
    SUM((oi.unit_price_minor * oi.quantity) - oi.discount_minor)::text AS amount
    FROM order_items oi INNER JOIN orders o ON o.id = oi.order_id
    WHERE o.status <> 'cancelled'
    GROUP BY oi.product_name, o.currency
    ORDER BY SUM(oi.quantity) DESC, oi.product_name ASC
    LIMIT 5`)
  const recent = await Order.query().orderBy('id', 'desc').limit(8)
  return {
    counts: Object.fromEntries(
      Object.entries(counts.rows[0]).map(([key, value]) => [key, Number(value)])
    ),
    // Aggregate monetary values remain strings: all-time totals can exceed JS safe integers.
    totals: totals.rows.map((row: { currency: string; count: string; amount: string }) => ({
      currency: row.currency,
      count: Number(row.count),
      amountMinor: row.amount,
      averageMinor: (BigInt(row.amount) / BigInt(row.count)).toString(),
    })),
    topProducts: top.rows.map(
      (row: { name: string; currency: string; quantity: string; amount: string }) => ({
        name: row.name,
        currency: row.currency,
        quantity: Number(row.quantity),
        amountMinor: row.amount,
      })
    ),
    recent: recent.map(orderSummary),
  }
}
