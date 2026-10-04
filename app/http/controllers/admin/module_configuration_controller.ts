import type { HttpContext } from '@adonisjs/core/http'
import { accessAdmin, manageStore } from '#policies/admin'
import ShippingRate from '#modules/shipping/models/shipping_rate'
import Coupon from '#modules/coupons/models/coupon'
import SaveShippingRate from '#modules/shipping/actions/save_shipping_rate'
import SaveCoupon from '#modules/coupons/actions/save_coupon'
import { shippingRateValidator } from '#modules/shipping/validators/shipping_rate'
import { couponValidator } from '#modules/coupons/validators/coupon'
import { validationMessages } from '#core/support/validation_messages'
export default class ModuleConfigurationController {
  async index(ctx: HttpContext) {
    await ctx.bouncer.authorize(accessAdmin)
    const rates = await ShippingRate.query().orderBy('id')
    const coupons = await Coupon.query().orderBy('id', 'desc').limit(100)
    return ctx.inertia.render('admin/module_configuration', {
      rates: rates.map((rate) => ({
        id: rate.id,
        name: rate.name,
        kind: rate.kind,
        currency: rate.currency,
        amountMinor: rate.amountMinor,
        freeAboveMinor: rate.freeAboveMinor,
        countries: rate.countries,
        isActive: rate.isActive,
      })),
      coupons: coupons.map((coupon) => ({
        id: coupon.id,
        code: coupon.code,
        kind: coupon.kind,
        currency: coupon.currency,
        value: coupon.value,
        minimumMinor: coupon.minimumMinor,
        startsAt: coupon.startsAt?.toISO() ?? null,
        endsAt: coupon.endsAt?.toISO() ?? null,
        usageLimit: coupon.usageLimit,
        uses: coupon.uses,
        isActive: coupon.isActive,
      })),
    })
  }
  async shipping(ctx: HttpContext) {
    await ctx.bouncer.authorize(manageStore)
    const input = await ctx.request.validateUsing(shippingRateValidator, {
      messagesProvider: validationMessages(ctx.locale),
    })
    await new SaveShippingRate().execute(input)
    ctx.session.flash('notice', 'modules.configurationSaved')
    return ctx.response.redirect().toPath('/admin/module-configuration')
  }
  async coupon(ctx: HttpContext) {
    await ctx.bouncer.authorize(manageStore)
    const input = await ctx.request.validateUsing(couponValidator, {
      messagesProvider: validationMessages(ctx.locale),
    })
    await new SaveCoupon().execute(input, ctx.locale)
    ctx.session.flash('notice', 'modules.configurationSaved')
    return ctx.response.redirect().toPath('/admin/module-configuration')
  }
}
