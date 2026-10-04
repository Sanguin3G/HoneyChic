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
    items: order.items.map((item) => ({
      id: item.id,
      productName: item.productName,
      variantDescription: item.variantDescription,
      sku: item.sku,
      unitPriceMinor: item.unitPriceMinor,
      quantity: item.quantity,
      discountMinor: item.discountMinor,
      taxMinor: item.taxMinor,
    })),
  }
}
