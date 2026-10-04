import type { HttpContext } from '@adonisjs/core/http'
import { manageStore } from '#policies/admin'
import { settingsValidator } from '#core/store/settings_validator'
import UpdateStoreSettings from '#core/store/update_store_settings'
import { validationMessages } from '#core/support/validation_messages'

export default class SettingsController {
  async edit(ctx: HttpContext) {
    await ctx.bouncer.authorize(manageStore)
    return ctx.inertia.render('admin/settings', {
      settings: {
        name: ctx.store.name,
        description: ctx.store.description,
        email: ctx.store.email,
        phone: ctx.store.phone,
        address: ctx.store.address,
        currency: ctx.store.currency,
        defaultLocale: ctx.store.defaultLocale,
        timezone: ctx.store.timezone,
        orderPrefix: ctx.store.orderPrefix,
        lowStockThreshold: ctx.store.lowStockThreshold,
        customerAccountsEnabled: ctx.store.customerAccountsEnabled,
        registrationEnabled: ctx.store.registrationEnabled,
        guestCheckoutEnabled: ctx.store.guestCheckoutEnabled,
      },
    })
  }

  async update(ctx: HttpContext) {
    await ctx.bouncer.authorize(manageStore)
    const input = await ctx.request.validateUsing(settingsValidator, {
      messagesProvider: validationMessages(ctx.locale),
    })
    await new UpdateStoreSettings().execute(input)
    ctx.session.flash('notice', 'settings.saved')
    return ctx.response.redirect().toPath('/admin/settings')
  }
}
