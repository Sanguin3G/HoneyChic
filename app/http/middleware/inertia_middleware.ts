import { publicOrigin, indexingEnabled } from '#core/support/seo'
import { cartSessionKey, readCartState, cartQuantity } from '#domains/cart/data/cart_state'
import BaseInertiaMiddleware from '@adonisjs/inertia/inertia_middleware'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import { storeConfig } from '#core/store/store_config'
import { publicStore } from '#core/store/public_store'
import { messagesFor } from '#core/support/translations'
import { accessAdmin, manageStore } from '#policies/admin'
import { resolveLocale } from '#core/support/locale'

export default class InertiaMiddleware extends BaseInertiaMiddleware {
  async share(ctx: HttpContext) {
    const locale = ctx.locale ?? resolveLocale({ storeDefault: storeConfig.defaultLocale })
    ctx.view.share({ locale })
    return {
      errors: this.getValidationErrors(ctx),
      locale,
      seo: { origin: publicOrigin, indexable: indexingEnabled },
      messages: messagesFor(locale),
      store: ctx.store ? publicStore(ctx.store) : storeConfig,
      auth: ctx.auth?.user
        ? {
            id: ctx.auth.user.id,
            fullName: ctx.auth.user.fullName,
            email: ctx.auth.user.email,
            role: ctx.auth.user.role,
          }
        : null,
      capabilities: ctx.capabilities ?? {},
      permissions: {
        admin: ctx.bouncer ? await ctx.bouncer.allows(accessAdmin) : false,
        manageStore: ctx.bouncer ? await ctx.bouncer.allows(manageStore) : false,
      },
      cartQuantity: cartQuantity(readCartState(ctx.session?.get(cartSessionKey))),
      notice: ctx.session?.flashMessages.get('notice') ?? null,
    }
  }

  async handle(ctx: HttpContext, next: NextFn) {
    await this.init(ctx)
    try {
      return await next()
    } finally {
      this.dispose(ctx)
    }
  }
}
