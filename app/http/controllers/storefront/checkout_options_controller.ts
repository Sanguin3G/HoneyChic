import vine from '@vinejs/vine'
import type { HttpContext } from '@adonisjs/core/http'
import CheckoutModules, { availableSelections } from '../../actions/checkout_modules.js'
import { readCartState, cartSessionKey } from '#domains/cart/data/cart_state'
import { readCart } from '#domains/cart/queries/read_cart'
import { rejectOrder } from '#domains/orders/errors/reject_order'
import { validationMessages } from '#core/support/validation_messages'
const validator = vine.create({
  shippingRateId: vine.number().withoutDecimals().positive().max(2147483647).optional(),
  country: vine.string().trim().toUpperCase().fixedLength(2).optional(),
  couponCode: vine.string().trim().toUpperCase().maxLength(40).optional(),
  paymentMethod: vine.enum(['cod', 'fake']).optional(),
})
export default class CheckoutOptionsController {
  async update(ctx: HttpContext) {
    const allowed = ctx.auth.user
      ? ctx.capabilities.customer_accounts.available
      : ctx.capabilities.guest_checkout.available
    if (!allowed) return ctx.response.forbidden()
    const input = await ctx.request.validateUsing(validator, {
      messagesProvider: validationMessages(ctx.locale),
    })
    const selections = availableSelections(
      {
        ...input,
        country: input.country ?? '',
        couponCode: input.couponCode ?? '',
      },
      ctx.capabilities
    )
    const cart = await readCart(readCartState(ctx.session.get(cartSessionKey)))
    if (cart.totalMinor === null || !cart.currency) rejectOrder('emptyCart', ctx.locale)
    await new CheckoutModules(ctx, selections).quote(cart.totalMinor, cart.currency)
    ctx.session.put('checkoutSelections', selections)
    ctx.session.forget('checkoutChargeReview')
    return ctx.response.redirect().toPath('/checkout')
  }
}
