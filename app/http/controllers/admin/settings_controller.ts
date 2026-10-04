import type { HttpContext } from '@adonisjs/core/http'
import { manageStore } from '#policies/admin'
import { brandImageValidator, settingsValidator } from '#core/store/settings_validator'
import UpdateStoreSettings from '#core/store/update_store_settings'
import { mediaUrl, releaseUnusedUploads } from '#core/support/stored_media'
import { storePublicImage } from '#core/support/store_public_image'
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
        logoKey: ctx.store.logoKey,
        faviconKey: ctx.store.faviconKey,
        logoUrl: ctx.store.logoKey ? mediaUrl(ctx.store.logoKey) : null,
        faviconUrl: ctx.store.faviconKey ? mediaUrl(ctx.store.faviconKey) : null,
        website: ctx.store.website,
        facebook: ctx.store.facebook,
        instagram: ctx.store.instagram,
        youtube: ctx.store.youtube,
        tiktok: ctx.store.tiktok,
        primaryColor: ctx.store.primaryColor,
        accentColor: ctx.store.accentColor,
      },
    })
  }

  async storeImage(ctx: HttpContext) {
    await ctx.bouncer.authorize(manageStore)
    const { image } = await ctx.request.validateUsing(brandImageValidator, {
      messagesProvider: validationMessages(ctx.locale),
    })
    const storageKey = await storePublicImage(image)
    return { storageKey, url: mediaUrl(storageKey) }
  }

  async update(ctx: HttpContext) {
    await ctx.bouncer.authorize(manageStore)
    const input = await ctx.request.validateUsing(settingsValidator, {
      messagesProvider: validationMessages(ctx.locale),
    })
    const previous = [ctx.store.logoKey, ctx.store.faviconKey].filter(
      (key): key is string => key !== null
    )
    try {
      await new UpdateStoreSettings().execute(input)
    } catch (error) {
      const kept = new Set(previous)
      await releaseUnusedUploads(
        [input.logoKey, input.faviconKey].filter((key): key is string => !!key && !kept.has(key))
      )
      throw error
    }
    await releaseUnusedUploads(previous)
    ctx.session.flash('notice', 'settings.saved')
    return ctx.response.redirect().toPath('/admin/settings')
  }
}
