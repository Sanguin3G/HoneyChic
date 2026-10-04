import CheckoutModules, {
  availableSelections,
  emptySelections,
} from '../../actions/checkout_modules.js'
import type { CheckoutCharges } from '#domains/orders/data/checkout_charges'
import ShippingRate from '#modules/shipping/models/shipping_rate'
import { randomUUID } from 'node:crypto'
import type { HttpContext } from '@adonisjs/core/http'
import { cartSessionKey, emptyCart, readCartState } from '#domains/cart/data/cart_state'
import { readCart } from '#domains/cart/queries/read_cart'
import PlaceOrder, { orderWasJustPlaced } from '#domains/orders/actions/place_order'
import DeliverOrderMail from '#domains/orders/actions/deliver_order_mail'
import CustomerAddress from '#domains/customers/models/customer_address'
import { checkoutValidator } from '#domains/orders/validators/orders'
import { rejectOrder } from '#domains/orders/errors/reject_order'
import { validationMessages } from '#core/support/validation_messages'
export default class CheckoutController {
  async show(ctx: HttpContext) {
    const account = ctx.auth.user
    const enabled = account
      ? ctx.capabilities.customer_accounts.available
      : ctx.capabilities.guest_checkout.available
    if (!enabled)
      return ctx.response.forbidden(
        await ctx.inertia.render('storefront/checkout', { enabled: false })
      )
    const cart = await readCart(readCartState(ctx.session.get(cartSessionKey)))
    if (!cart.items.length) return ctx.response.redirect().toPath('/cart')
    if (!ctx.session.get('checkoutToken') || ctx.session.get('checkoutCompleted')) {
      ctx.session.put('checkoutToken', randomUUID())
      ctx.session.forget('checkoutCompleted')
    }
    if (cart.totalMinor !== null)
      ctx.session.put('checkoutReview', {
        currency: cart.currency,
        lines: cart.items.map((item) => [item.variantId, item.quantity, item.unitPriceMinor]),
      })
    else ctx.session.forget('checkoutReview')
    const addresses = account
      ? await CustomerAddress.query().where('customerId', account.id).orderBy('id')
      : []
    ctx.session.forget('checkoutChargeReview')
    const selections = availableSelections(
      ctx.session.get('checkoutSelections', emptySelections),
      ctx.capabilities
    )
    ctx.session.put('checkoutSelections', selections)
    let pricing: (CheckoutCharges & { totalMinor: number }) | null = null
    if (cart.totalMinor !== null && cart.currency) {
      try {
        const charges = await new CheckoutModules(ctx, selections).quote(
          cart.totalMinor,
          cart.currency
        )
        const total =
          BigInt(cart.totalMinor) - BigInt(charges.discountMinor) + BigInt(charges.shippingMinor)
        if (total <= BigInt(Number.MAX_SAFE_INTEGER)) {
          pricing = { ...charges, totalMinor: Number(total) }
          ctx.session.put('checkoutChargeReview', charges)
        }
      } catch (error) {
        if ((error as { code?: string }).code !== 'E_VALIDATION_ERROR') throw error
      }
    }
    const rates = ctx.capabilities.shipping.available
      ? await ShippingRate.query()
          .where('isActive', true)
          .where('currency', cart.currency ?? '')
          .orderBy('id')
      : []
    return ctx.inertia.render('storefront/checkout', {
      enabled: true,
      pricing,
      selections,
      rates: rates.map((rate) => ({ id: rate.id, name: rate.name, countries: rate.countries })),
      cart,
      token: ctx.session.get('checkoutToken'),
      addresses: addresses.map((row) => ({
        id: row.id,
        label: row.label,
        recipient: row.recipient,
        phone: row.phone,
        address: row.address,
      })),
    })
  }
  async store(ctx: HttpContext) {
    const input = await ctx.request.validateUsing(checkoutValidator, {
      messagesProvider: validationMessages(ctx.locale),
    })
    if (input.token !== ctx.session.get('checkoutToken')) rejectOrder('invalidCheckout', ctx.locale)
    const order = await new PlaceOrder().execute(
      readCartState(ctx.session.get(cartSessionKey)),
      input,
      ctx.auth.user?.id ?? null,
      ctx.locale,
      readCartState(ctx.session.get('checkoutReview')),
      new CheckoutModules(
        ctx,
        ctx.session.get('checkoutSelections', emptySelections),
        ctx.session.get('checkoutChargeReview')
      )
    )
    if (!order.customerId) ctx.session.put('guestOrder', order.publicId)
    if (!ctx.session.get('checkoutCompleted')) ctx.session.put(cartSessionKey, emptyCart())
    ctx.session.put('checkoutCompleted', true)
    if (orderWasJustPlaced(order)) {
      const sent = await new DeliverOrderMail().execute(order, 'confirmation')
      if (!sent) ctx.session.flash('notice', 'orders.mailFailed')
    }
    return ctx.response.redirect().toPath('/orders/' + order.publicId)
  }
}
