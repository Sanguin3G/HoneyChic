import type { HttpContext } from '@adonisjs/core/http'
import { accessAdmin } from '#policies/admin'
import User from '#domains/customers/models/user'
import Order from '#domains/orders/models/order'
import { orderSummary } from '#domains/orders/data/order_data'
import {
  customerIdValidator,
  customerListValidator,
  customerUpdateValidator,
} from '#domains/customers/validators/admin_customers'
import { validationMessages } from '#core/support/validation_messages'
export default class CustomersController {
  async index(ctx: HttpContext) {
    await ctx.bouncer.authorize(accessAdmin)
    const input = await ctx.request.validateUsing(customerListValidator, {
      messagesProvider: validationMessages(ctx.locale),
    })
    const query = User.query().where('role', 'customer')
    if (input.q)
      query.where((scope) =>
        scope.whereILike('fullName', '%' + input.q + '%').orWhereILike('email', '%' + input.q + '%')
      )
    const result = await query.orderBy('id', 'desc').paginate(input.page ?? 1, 20)
    return ctx.inertia.render('admin/customers/index', {
      customers: result
        .all()
        .map((user) => ({ id: user.id, fullName: user.fullName, email: user.email })),
      filters: { q: input.q ?? '' },
      pagination: { page: result.currentPage, lastPage: result.lastPage, total: result.total },
    })
  }
  async show(ctx: HttpContext) {
    await ctx.bouncer.authorize(accessAdmin)
    const { id } = await customerIdValidator.validate(ctx.params, {
      messagesProvider: validationMessages(ctx.locale),
    })
    const customer = await User.query().where('role', 'customer').where('id', id).firstOrFail()
    const input = await ctx.request.validateUsing(customerListValidator, {
      messagesProvider: validationMessages(ctx.locale),
    })
    const result = await Order.query()
      .where('customerId', customer.id)
      .orderBy('id', 'desc')
      .paginate(input.page ?? 1, 20)
    return ctx.inertia.render('admin/customers/show', {
      customer: { id: customer.id, fullName: customer.fullName, email: customer.email },
      orders: result.all().map(orderSummary),
      pagination: { page: result.currentPage, lastPage: result.lastPage, total: result.total },
    })
  }
  async update(ctx: HttpContext) {
    await ctx.bouncer.authorize(accessAdmin)
    const { id } = await customerIdValidator.validate(ctx.params, {
      messagesProvider: validationMessages(ctx.locale),
    })
    const input = await ctx.request.validateUsing(customerUpdateValidator, {
      messagesProvider: validationMessages(ctx.locale),
    })
    const customer = await User.query().where('role', 'customer').where('id', id).firstOrFail()
    await customer.merge(input).save()
    ctx.session.flash('notice', 'admin.customerSaved')
    return ctx.response.redirect().toPath('/admin/customers/' + customer.id)
  }
}
