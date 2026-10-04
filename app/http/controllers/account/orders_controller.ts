import type { HttpContext } from '@adonisjs/core/http'
import Order from '#domains/orders/models/order'
import { scopedOrder } from '#domains/orders/queries/scoped_order'
import { orderPayment } from '#modules/payments/queries/order_payment'
import CancelOrder from '#domains/orders/actions/cancel_order'
import DeliverOrderMail from '#domains/orders/actions/deliver_order_mail'
import { orderDetail, orderSummary } from '#domains/orders/data/order_data'
import { orderListValidator } from '#domains/orders/validators/orders'
import { validationMessages } from '#core/support/validation_messages'
export default class OrdersController {
  async index(ctx: HttpContext) {
    const input = await ctx.request.validateUsing(orderListValidator, {
      messagesProvider: validationMessages(ctx.locale),
    })
    const result = await Order.query()
      .where('customerId', ctx.auth.getUserOrFail().id)
      .orderBy('id', 'desc')
      .paginate(input.page ?? 1, 20)
    return ctx.inertia.render('account/orders', {
      orders: result.all().map(orderSummary),
      pagination: { page: result.currentPage, lastPage: result.lastPage, total: result.total },
    })
  }
  async show(ctx: HttpContext) {
    const order = await scopedOrder(
      ctx.params.id,
      ctx.auth.user?.id ?? null,
      ctx.session.get('guestOrder'),
      ctx.locale
    )
    return ctx.inertia.render('account/order', {
      order: orderDetail(order),
      payment: await orderPayment(order.id),
      canCancel: order.status === 'pending' && order.paymentStatus === 'unpaid',
    })
  }
  async cancel(ctx: HttpContext) {
    const order = await scopedOrder(
      ctx.params.id,
      ctx.auth.user?.id ?? null,
      ctx.session.get('guestOrder'),
      ctx.locale
    )
    const before = order.status
    const updated = await new CancelOrder().execute(
      order.publicId,
      {
        id: ctx.auth.user?.id ?? null,
        admin: false,
        guestOrder: ctx.session.get('guestOrder'),
      },
      ctx.locale
    )
    if (before !== updated.status) {
      const sent = await new DeliverOrderMail().execute(updated, 'cancelled')
      if (!sent) {
        ctx.session.flash('notice', 'orders.mailFailed')
        return ctx.response.redirect().toPath('/orders/' + order.publicId)
      }
    }
    ctx.session.flash('notice', 'orders.cancelledNotice')
    return ctx.response.redirect().toPath('/orders/' + order.publicId)
  }
}
