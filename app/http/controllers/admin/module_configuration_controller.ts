import ShippingRate from '#modules/shipping/shipping_rate'
import Coupon from '#modules/coupons/coupon'
import type { HttpContext } from '@adonisjs/core/http'
import { manageStore } from '#policies/admin'
import SaveShippingRate from '#modules/shipping/save_shipping_rate'
import SaveCoupon from '#modules/coupons/save_coupon'
import { shippingRateValidator } from '#modules/shipping/validators'
import { couponValidator } from '#modules/coupons/validators'
export async function moduleConfiguration() {
  const rates = await ShippingRate.query().orderBy('id')
  const coupons = await Coupon.query().orderBy('id', 'desc').limit(100)
  return {
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
  }
}

export default class ModuleConfigurationController {
  /** Rates and coupons now live on the Features page. */
  async index(ctx: HttpContext) {
    return ctx.response.redirect().toPath('/admin/modules')
  }
  async shipping(ctx: HttpContext) {
    await ctx.bouncer.authorize(manageStore)
    const input = await ctx.request.validateUsing(shippingRateValidator)
    await new SaveShippingRate().execute(input)
    ctx.session.flash('notice', 'modules.configurationSaved')
    return ctx.response.redirect().toPath('/admin/modules')
  }
  async coupon(ctx: HttpContext) {
    await ctx.bouncer.authorize(manageStore)
    const input = await ctx.request.validateUsing(couponValidator)
    await new SaveCoupon().execute(input, ctx.locale)
    ctx.session.flash('notice', 'modules.configurationSaved')
    return ctx.response.redirect().toPath('/admin/modules')
  }
}
