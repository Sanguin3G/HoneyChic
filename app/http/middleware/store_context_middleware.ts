import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import StoreSetting from '#core/store/store_setting'
import { capabilitiesFor } from '#core/capabilities/capabilities'

export default class StoreContextMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    // Liveness must not depend on the database.
    if (['/health', '/health/ready'].includes(ctx.request.url())) return next()
    ctx.store = await StoreSetting.findOrFail(1)
    ctx.capabilities = capabilitiesFor(ctx.store)
    await ctx.auth.check()
    if (ctx.auth.user?.role === 'customer' && !ctx.capabilities.customer_accounts.available) {
      await ctx.auth.use('web').logout()
    }
    if (ctx.auth.isAuthenticated || /^\/(cart|checkout|orders)(?:\/|$)/.test(ctx.request.url()))
      ctx.response.header('Cache-Control', 'private, no-store')
    return next()
  }
}

declare module '@adonisjs/core/http' {
  interface HttpContext {
    store: StoreSetting
    capabilities: ReturnType<typeof capabilitiesFor>
  }
}
