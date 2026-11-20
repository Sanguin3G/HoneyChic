import type Order from '#domains/orders/models/order'
export function orderSummary(order: Order) {
  return {
    publicId: order.publicId,
    number: order.number,
    status: order.status,
    paymentStatus: order.paymentStatus,
    currency: order.currency,
    totalMinor: order.totalMinor,
    customerName: order.customerName,
    createdAt: order.createdAt.toISO(),
  }
}
export function orderDetail(order: Order) {
  const refunds = order.refunds ?? []
  const returns = order.returns ?? []
  const returnedByItem = new Map<number, number>()
  for (const row of returns) {
    returnedByItem.set(row.orderItemId, (returnedByItem.get(row.orderItemId) ?? 0) + row.quantity)
  }
  const refundedMinor = refunds.reduce((sum, row) => sum + row.amountMinor, 0)
  return {
    ...orderSummary(order),
    discountMinor: order.discountMinor,
    shippingMinor: order.shippingMinor,
    shippingName: order.shippingName,
    couponCode: order.couponCode,
    customerEmail: order.customerEmail,
    customerPhone: order.customerPhone,
    deliveryAddress: order.deliveryAddress,
    note: order.note,
    refundedMinor,
    refunds: refunds.map((row) => ({
      id: row.id,
      amountMinor: row.amountMinor,
      reference: row.reference,
      note: row.note,
      createdAt: row.createdAt.toISO(),
    })),
    returns: returns.map((row) => ({
      id: row.id,
      orderItemId: row.orderItemId,
      quantity: row.quantity,
      reference: row.reference,
      note: row.note,
      createdAt: row.createdAt.toISO(),
    })),
    items: order.items.map((item) => ({
      id: item.id,
      productName: item.productName,
      variantDescription: item.variantDescription,
      sku: item.sku,
      unitPriceMinor: item.unitPriceMinor,
      quantity: item.quantity,
      returnedQuantity: returnedByItem.get(item.id) ?? 0,
      discountMinor: item.discountMinor,
      taxMinor: item.taxMinor,
    })),
  }
}
