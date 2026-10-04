import type { HttpContext } from '@adonisjs/core/http'
import {
  cartSessionKey,
  emptyCart,
  readCartState,
  removeCartItem,
} from '#domains/cart/data/cart_state'
import ChangeCartQuantity from '#domains/cart/actions/change_cart_quantity'
import { readCart } from '#domains/cart/queries/read_cart'
import {
  addCartValidator,
  updateCartValidator,
  cartVariantValidator,
} from '#domains/cart/validators/cart'
import { validationMessages } from '#core/support/validation_messages'

export default class CartController {
  async show(ctx: HttpContext) {
    return ctx.inertia.render('storefront/cart', {
      cart: await readCart(readCartState(ctx.session.get(cartSessionKey))),
    })
  }
  async add(ctx: HttpContext) {
    const input = await ctx.request.validateUsing(addCartValidator, {
      messagesProvider: validationMessages(ctx.locale),
    })
    const state = await new ChangeCartQuantity().execute(
      readCartState(ctx.session.get(cartSessionKey)),
      { ...input, mode: 'add' },
      ctx.locale
    )
    ctx.session.put(cartSessionKey, state)
    ctx.session.flash('notice', 'cart.added')
    return ctx.response.redirect().toPath('/cart')
  }
  private async variantId(ctx: HttpContext) {
    const { id } = await cartVariantValidator.validate(ctx.params, {
      messagesProvider: validationMessages(ctx.locale),
    })
    return id
  }
  async update(ctx: HttpContext) {
    const input = await ctx.request.validateUsing(updateCartValidator, {
      messagesProvider: validationMessages(ctx.locale),
    })
    const state = await new ChangeCartQuantity().execute(
      readCartState(ctx.session.get(cartSessionKey)),
      { ...input, variantId: await this.variantId(ctx), mode: 'replace' },
      ctx.locale
    )
    ctx.session.put(cartSessionKey, state)
    ctx.session.flash('notice', 'cart.updated')
    return ctx.response.redirect().toPath('/cart')
  }
  async remove(ctx: HttpContext) {
    ctx.session.put(
      cartSessionKey,
      removeCartItem(readCartState(ctx.session.get(cartSessionKey)), await this.variantId(ctx))
    )
    ctx.session.flash('notice', 'cart.removed')
    return ctx.response.redirect().toPath('/cart')
  }
  async clear(ctx: HttpContext) {
    ctx.session.put(cartSessionKey, emptyCart())
    ctx.session.flash('notice', 'cart.cleared')
    return ctx.response.redirect().toPath('/cart')
  }
}
