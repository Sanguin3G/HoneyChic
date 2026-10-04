import { orderPayment } from '#modules/payments/queries/order_payment'
import type { HttpContext } from '@adonisjs/core/http'
import { accessAdmin } from '#policies/admin'
import Order from '#domains/orders/models/order'
import { orderDetail, orderSummary } from '#domains/orders/data/order_data'
import {
  orderListValidator,
  orderStatusValidator,
  orderIdValidator,
} from '#domains/orders/validators/orders'
import { orderTransitions } from '#domains/orders/data/order_states'
import ChangeOrderStatus from '#domains/orders/actions/change_order_status'
import { validationMessages } from '#core/support/validation_messages'
export default class OrdersController {
  async index(ctx: HttpContext) {
    await ctx.bouncer.authorize(accessAdmin)
    const input = await ctx.request.validateUsing(orderListValidator, {
      messagesProvider: validationMessages(ctx.locale),
    })
    const query = Order.query()
    if (input.status) query.where('status', input.status)
    if (input.q)
      query.where((scope) =>
        scope
          .whereILike('number', '%' + input.q + '%')
          .orWhereILike('customerName', '%' + input.q + '%')
          .orWhereILike('customerEmail', '%' + input.q + '%')
      )
    const result = await query.orderBy('id', 'desc').paginate(input.page ?? 1, 20)
    return ctx.inertia.render('admin/orders/index', {
      orders: result.all().map(orderSummary),
      filters: { q: input.q ?? '', status: input.status ?? '' },
      pagination: { page: result.currentPage, lastPage: result.lastPage, total: result.total },
    })
  }
  async show(ctx: HttpContext) {
    await ctx.bouncer.authorize(accessAdmin)
    const { id } = await orderIdValidator.validate(ctx.params, {
      messagesProvider: validationMessages(ctx.locale),
    })
    const order = await Order.query()
      .where('publicId', id)
      .preload('items', (items) => items.orderBy('id'))
      .firstOrFail()
    return ctx.inertia.render('admin/orders/show', {
      order: orderDetail(order),
      payment: await orderPayment(order.id),
      transitions: orderTransitions[order.status].filter(
        (status) => status !== 'cancelled' || order.paymentStatus === 'unpaid'
      ),
    })
  }
  async update(ctx: HttpContext) {
    await ctx.bouncer.authorize(accessAdmin)
    const { status } = await ctx.request.validateUsing(orderStatusValidator, {
      messagesProvider: validationMessages(ctx.locale),
    })
    const { id } = await orderIdValidator.validate(ctx.params, {
      messagesProvider: validationMessages(ctx.locale),
    })
    await new ChangeOrderStatus().execute(id, status, ctx.auth.getUserOrFail().id, ctx.locale)
    ctx.session.flash('notice', 'admin.orderSaved')
    return ctx.response.redirect().toPath('/admin/orders/' + ctx.params.id)
  }
}
