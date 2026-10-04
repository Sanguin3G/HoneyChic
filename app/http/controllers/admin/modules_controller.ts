import { moduleFlags } from '#core/capabilities/capabilities'
import vine from '@vinejs/vine'
import type { HttpContext } from '@adonisjs/core/http'
import { accessAdmin, manageStore } from '#policies/admin'
import UpdateCapabilities from '#core/capabilities/update_capabilities'
import { validationMessages } from '#core/support/validation_messages'
const validator = vine.create({
  guestCheckoutEnabled: vine.boolean(),
  customerAccountsEnabled: vine.boolean(),
  registrationEnabled: vine.boolean(),
  reviewsEnabled: vine.boolean().optional(),
  wishlistEnabled: vine.boolean().optional(),
  couponsEnabled: vine.boolean().optional(),
  shippingEnabled: vine.boolean().optional(),
  codEnabled: vine.boolean().optional(),
  fakePaymentEnabled: vine.boolean().optional(),
})
export default class ModulesController {
  async index(ctx: HttpContext) {
    await ctx.bouncer.authorize(accessAdmin)
    return ctx.inertia.render('admin/modules', {
      settings: {
        ...Object.fromEntries(Object.values(moduleFlags).map((flag) => [flag, ctx.store[flag]])),
        guestCheckoutEnabled: ctx.store.guestCheckoutEnabled,
        customerAccountsEnabled: ctx.store.customerAccountsEnabled,
        registrationEnabled: ctx.store.registrationEnabled,
      },
    })
  }
  async update(ctx: HttpContext) {
    await ctx.bouncer.authorize(manageStore)
    const input = await ctx.request.validateUsing(validator, {
      messagesProvider: validationMessages(ctx.locale),
    })
    await new UpdateCapabilities().execute(input)
    ctx.session.flash('notice', 'admin.modulesSaved')
    return ctx.response.redirect().toPath('/admin/modules')
  }
}
