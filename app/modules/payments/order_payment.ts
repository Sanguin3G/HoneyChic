import Payment from '#modules/payments/payment'
export async function orderPayment(orderId: number) {
  const payment = await Payment.query().where('orderId', orderId).first()
  return payment ? { method: payment.method, status: payment.status } : null
}
