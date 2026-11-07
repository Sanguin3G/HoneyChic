import type { HttpContext } from '@adonisjs/core/http'
import vine from '@vinejs/vine'
import { manageStore } from '#policies/admin'
import { profileFlags, storeProfiles } from '#core/capabilities/store_profiles'
import UpdateCapabilities from '#core/capabilities/update_capabilities'
import StoreSetting from '#core/store/store_setting'
import { settingsValidator } from '#core/store/settings_validator'
import UpdateStoreSettings from '#core/store/update_store_settings'
import { validationMessages } from '#core/support/validation_messages'

const validator = vine.create({
  storeProfile: vine.enum(storeProfiles),
  name: vine.string().trim().minLength(1).maxLength(120),
  currency: vine.string().trim().toUpperCase().fixedLength(3),
  defaultLocale: vine.enum(['en', 'vi'] as const),
  timezone: vine.string().trim().minLength(1).maxLength(80),
  orderPrefix: vine.string().trim().minLength(1).maxLength(12),
})

export default class SetupController {
  async show(ctx: HttpContext) {
    await ctx.bouncer.authorize(manageStore)
    return ctx.inertia.render('admin/setup', {
      setup: {
        storeProfile: ctx.store.storeProfile,
        name: ctx.store.name,
        currency: ctx.store.currency,
        defaultLocale: ctx.store.defaultLocale,
        timezone: ctx.store.timezone,
        orderPrefix: ctx.store.orderPrefix,
      },
    })
  }

  async store(ctx: HttpContext) {
    await ctx.bouncer.authorize(manageStore)
    const input = await ctx.request.validateUsing(validator, {
      messagesProvider: validationMessages(ctx.locale),
    })
    const current = await StoreSetting.findOrFail(1)
    const checked = await settingsValidator.validate(
      {
        name: input.name,
        description: current.description,
        email: current.email,
        phone: current.phone,
        address: current.address,
        currency: input.currency,
        defaultLocale: input.defaultLocale,
        timezone: input.timezone,
        orderPrefix: input.orderPrefix,
        lowStockThreshold: current.lowStockThreshold,
        customerAccountsEnabled: current.customerAccountsEnabled,
        registrationEnabled: current.registrationEnabled,
        guestCheckoutEnabled: current.guestCheckoutEnabled,
        logoKey: current.logoKey,
        faviconKey: current.faviconKey,
        website: current.website,
        facebook: current.facebook,
        instagram: current.instagram,
        youtube: current.youtube,
        tiktok: current.tiktok,
        primaryColor: current.primaryColor,
        accentColor: current.accentColor,
      },
      { messagesProvider: validationMessages(ctx.locale) }
    )
    if (input.storeProfile !== 'custom') {
      await new UpdateCapabilities().execute(profileFlags[input.storeProfile])
    }
    const store = await StoreSetting.findOrFail(1)
    store.storeProfile = input.storeProfile
    await store.save()
    await store.refresh()
    await new UpdateStoreSettings().execute({
      ...checked,
      customerAccountsEnabled: store.customerAccountsEnabled,
      registrationEnabled: store.registrationEnabled,
      guestCheckoutEnabled: store.guestCheckoutEnabled,
    })
    ctx.session.flash('notice', 'admin.setupSaved')
    return ctx.response.redirect().toPath('/admin/setup')
  }
}
