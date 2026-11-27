import { validationMessages } from '#core/support/validation_messages'
import type { HttpContext } from '@adonisjs/core/http'
import { scopedOrder } from '#domains/orders/queries/scoped_order'
import Payment from '#modules/payments/payment'
import SettlePayment from '#modules/payments/settle_payment'
import Order from '#domains/orders/models/order'
import { orderIdValidator } from '#domains/orders/validators'
export default class PaymentsController {
  async simulate(ctx: HttpContext) {
    const order = await scopedOrder(
      ctx.params.id,
      ctx.auth.user?.id ?? null,
      ctx.session.get('guestOrder'),
      ctx.locale
    )
    const payment = await Payment.query()
      .where('orderId', order.id)
      .where('method', 'fake')
      .firstOrFail()
    await new SettlePayment().execute(
      payment.publicId,
      {
        reference: 'fake:' + payment.publicId,
        amountMinor: order.totalMinor,
        currency: order.currency,
      },
      {
        customerId: ctx.auth.user?.id ?? null,
        guestOrder: ctx.session.get('guestOrder'),
        administrator: false,
      },
      ctx.locale
    )
    ctx.session.flash('notice', 'modules.paymentPaid')
    return ctx.response.redirect().toPath('/orders/' + order.publicId)
  }
  async collect(ctx: HttpContext) {
    const { id } = await orderIdValidator.validate(ctx.params, {
      messagesProvider: validationMessages(ctx.locale),
    })
    const order = await Order.query().where('publicId', id).firstOrFail()
    const payment = await Payment.query()
      .where('orderId', order.id)
      .where('method', 'cod')
      .firstOrFail()
    await new SettlePayment().execute(
      payment.publicId,
      {
        reference: 'cod:' + payment.publicId,
        amountMinor: order.totalMinor,
        currency: order.currency,
      },
      { customerId: ctx.auth.getUserOrFail().id, administrator: true },
      ctx.locale
    )
    ctx.session.flash('notice', 'modules.paymentPaid')
    return ctx.response.redirect().toPath('/admin/orders/' + order.publicId)
  }
}
