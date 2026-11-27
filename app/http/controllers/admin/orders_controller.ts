import { orderPayment } from '#modules/payments/order_payment'
import type { HttpContext } from '@adonisjs/core/http'
import Order from '#domains/orders/models/order'
import { orderDetail, orderSummary } from '#domains/orders/data/order_data'
import { orderExportLimit, ordersCsv } from '#domains/orders/data/order_csv'
import { adminOrders } from '#domains/orders/queries/admin_orders'
import {
  orderListValidator,
  orderStatusValidator,
  orderIdValidator,
  orderRefundValidator,
  orderReturnValidator,
} from '#domains/orders/validators'
import { orderTransitions } from '#domains/orders/data/order_states'
import ChangeOrderStatus from '#domains/orders/actions/change_order_status'
import RecordRefund from '#domains/orders/actions/record_refund'
import RecordReturn from '#domains/orders/actions/record_return'
import DeliverOrderMail from '#domains/orders/actions/deliver_order_mail'
import { validationMessages } from '#core/support/validation_messages'
export default class OrdersController {
  async index(ctx: HttpContext) {
    const input = await ctx.request.validateUsing(orderListValidator)
    const result = await adminOrders(input)
      .orderBy('id', 'desc')
      .paginate(input.page ?? 1, 20)
    return ctx.inertia.render('admin/orders/index', {
      orders: result.all().map(orderSummary),
      filters: { q: input.q ?? '', status: input.status ?? '' },
      pagination: { page: result.currentPage, lastPage: result.lastPage, total: result.total },
    })
  }
  async export(ctx: HttpContext) {
    const input = await ctx.request.validateUsing(orderListValidator)
    const orders = await adminOrders(input).orderBy('id', 'desc').limit(orderExportLimit())
    ctx.response.header('Content-Type', 'text/csv; charset=utf-8')
    ctx.response.header('Content-Disposition', 'attachment; filename="orders.csv"')
    ctx.response.header('Cache-Control', 'no-store')
    return ctx.response.send(ordersCsv(orders, ctx.store.timezone))
  }

  async show(ctx: HttpContext) {
    const { id } = await orderIdValidator.validate(ctx.params, {
      messagesProvider: validationMessages(ctx.locale),
    })
    const order = await Order.query()
      .where('publicId', id)
      .preload('items', (items) => items.orderBy('id'))
      .preload('refunds', (refunds) => refunds.orderBy('id'))
      .preload('returns', (returns) => returns.orderBy('id'))
      .firstOrFail()
    return ctx.inertia.render('admin/orders/show', {
      order: orderDetail(order),
      payment: await orderPayment(order.id),
      transitions: orderTransitions[order.status].filter(
        (status) =>
          status !== 'cancelled' || (order.paymentStatus === 'unpaid' && !order.returns?.length)
      ),
    })
  }
  async update(ctx: HttpContext) {
    const { status } = await ctx.request.validateUsing(orderStatusValidator)
    const { id } = await orderIdValidator.validate(ctx.params, {
      messagesProvider: validationMessages(ctx.locale),
    })
    const current = await Order.query().where('publicId', id).firstOrFail()
    const order = await new ChangeOrderStatus().execute(
      id,
      status,
      ctx.auth.getUserOrFail().id,
      ctx.locale
    )
    const kind = order.status === 'shipped' || order.status === 'cancelled' ? order.status : null
    if (kind && current.status !== order.status) {
      const sent = await new DeliverOrderMail().execute(order, kind)
      if (!sent) {
        ctx.session.flash('notice', 'orders.mailFailed')
        return ctx.response.redirect().toPath('/admin/orders/' + ctx.params.id)
      }
    }
    ctx.session.flash('notice', 'admin.orderSaved')
    return ctx.response.redirect().toPath('/admin/orders/' + ctx.params.id)
  }

  async refund(ctx: HttpContext) {
    const { id } = await orderIdValidator.validate(ctx.params, {
      messagesProvider: validationMessages(ctx.locale),
    })
    const input = await ctx.request.validateUsing(orderRefundValidator)
    await new RecordRefund().execute(
      id,
      input,
      { id: ctx.auth.getUserOrFail().id, admin: true },
      ctx.locale
    )
    ctx.session.flash('notice', 'orders.refundSaved')
    return ctx.response.redirect().toPath('/admin/orders/' + id)
  }

  async returnItem(ctx: HttpContext) {
    const { id } = await orderIdValidator.validate(ctx.params, {
      messagesProvider: validationMessages(ctx.locale),
    })
    const input = await ctx.request.validateUsing(orderReturnValidator)
    await new RecordReturn().execute(
      id,
      input,
      { id: ctx.auth.getUserOrFail().id, admin: true },
      ctx.locale
    )
    ctx.session.flash('notice', 'orders.returnSaved')
    return ctx.response.redirect().toPath('/admin/orders/' + id)
  }
}
