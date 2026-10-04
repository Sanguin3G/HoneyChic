import type { HttpContext } from '@adonisjs/core/http'
import CustomerAddress from '#domains/customers/models/customer_address'
import SaveAddress from '#domains/customers/actions/save_address'
import { addressValidator, addressIdValidator } from '#domains/customers/validators/addresses'
import { validationMessages } from '#core/support/validation_messages'
export default class AddressesController {
  async index(ctx: HttpContext) {
    const rows = await CustomerAddress.query()
      .where('customerId', ctx.auth.getUserOrFail().id)
      .orderBy('id')
    return ctx.inertia.render('account/addresses', {
      addresses: rows.map((row) => ({
        id: row.id,
        label: row.label,
        recipient: row.recipient,
        phone: row.phone,
        address: row.address,
      })),
    })
  }
  async store(ctx: HttpContext) {
    const input = await ctx.request.validateUsing(addressValidator, {
      messagesProvider: validationMessages(ctx.locale),
    })
    await new SaveAddress().execute(ctx.auth.getUserOrFail().id, input, ctx.locale)
    return ctx.response.redirect().toPath('/account/addresses')
  }
  async update(ctx: HttpContext) {
    const { id } = await addressIdValidator.validate(ctx.params, {
      messagesProvider: validationMessages(ctx.locale),
    })
    const input = await ctx.request.validateUsing(addressValidator, {
      messagesProvider: validationMessages(ctx.locale),
    })
    await new SaveAddress().execute(ctx.auth.getUserOrFail().id, input, ctx.locale, id)
    return ctx.response.redirect().toPath('/account/addresses')
  }
  async destroy(ctx: HttpContext) {
    const { id } = await addressIdValidator.validate(ctx.params, {
      messagesProvider: validationMessages(ctx.locale),
    })
    const row = await CustomerAddress.query()
      .where('customerId', ctx.auth.getUserOrFail().id)
      .where('id', id)
      .firstOrFail()
    await row.delete()
    return ctx.response.redirect().toPath('/account/addresses')
  }
}
