import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class GuestMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    if (ctx.auth.isAuthenticated) {
      if (ctx.auth.user!.role === 'customer' && !ctx.capabilities.customer_accounts.available) {
        await ctx.auth.use('web').logout()
      } else return ctx.response.redirect().toPath('/account')
    }
    return next()
  }
}
