import type { HttpContext } from '@adonisjs/core/http'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'
import type { CheckoutCharges, CheckoutParticipation } from '#domains/orders/data/checkout_charges'
import type Order from '#domains/orders/models/order'
import type Coupon from '#modules/coupons/coupon'
import ApplyCoupon from '#modules/coupons/apply_coupon'
import QuoteShipping from '#modules/shipping/quote_shipping'
import CreatePayment from '#modules/payments/create_payment'
import StoreSetting from '#core/store/store_setting'
import { capabilitiesFor } from '#core/capabilities/capabilities'
import { paymentProviders, type PaymentMethod } from '#modules/payments/providers/index'
import { rejectModule } from '#modules/require_capability'
import { rejectOrder } from '#domains/orders/reject_order'
export interface CheckoutSelections {
  shippingRateId?: number
  country: string
  couponCode: string
  paymentMethod?: PaymentMethod
}
export const emptySelections: CheckoutSelections = { country: '', couponCode: '' }
export function availableSelections(
  selections: CheckoutSelections,
  capabilities: HttpContext['capabilities']
): CheckoutSelections {
  const method = selections.paymentMethod
  return {
    shippingRateId: capabilities.shipping.available ? selections.shippingRateId : undefined,
    country: capabilities.shipping.available ? selections.country : '',
    couponCode: capabilities.coupons.available ? selections.couponCode : '',
    paymentMethod:
      method && capabilities[paymentProviders[method].capability].available ? method : undefined,
  }
}
export default class CheckoutModules implements CheckoutParticipation {
  private coupon?: Coupon
  constructor(
    private ctx: HttpContext,
    private selections: CheckoutSelections,
    private reviewed?: CheckoutCharges
  ) {}
  async quote(subtotal: number, currency: string, trx?: TransactionClientContract) {
    const store = trx
      ? await StoreSetting.query({ client: trx }).where('id', 1).forShare().firstOrFail()
      : this.ctx.store
    const capabilities = capabilitiesFor(store)
    const result: CheckoutCharges = {
      shippingMinor: 0,
      shippingName: '',
      discountMinor: 0,
      couponCode: '',
    }
    if (capabilities.shipping.available)
      Object.assign(
        result,
        await new QuoteShipping().execute(
          this.selections.shippingRateId,
          this.selections.country,
          subtotal,
          currency,
          this.ctx.locale,
          trx
        )
      )
    else if (this.selections.shippingRateId) rejectModule('disabled', this.ctx.locale)
    if (this.selections.couponCode) {
      const applied = await new ApplyCoupon().execute(
        this.selections.couponCode,
        subtotal,
        currency,
        this.ctx.locale,
        trx
      )
      this.coupon = applied.coupon
      result.discountMinor = applied.discountMinor
      result.couponCode = applied.coupon.code
    }
    const method = this.selections.paymentMethod
    const paymentEnabled =
      capabilities['payments.cod'].available || capabilities['payments.fake'].available
    if (paymentEnabled && !method) rejectModule('paymentRequired', this.ctx.locale)
    if (method && !capabilities[paymentProviders[method].capability].available)
      rejectModule('disabled', this.ctx.locale)
    if (
      this.reviewed &&
      Object.keys(result).some(
        (key) =>
          result[key as keyof CheckoutCharges] !== this.reviewed![key as keyof CheckoutCharges]
      )
    )
      rejectOrder('priceChanged', this.ctx.locale)
    return result
  }
  async created(order: Order, trx: TransactionClientContract) {
    if (this.coupon) await new ApplyCoupon().redeem(this.coupon, order.id, trx)
    if (this.selections.paymentMethod)
      await new CreatePayment().execute(order, this.selections.paymentMethod, this.ctx.locale, trx)
  }
}
