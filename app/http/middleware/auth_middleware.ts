import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class AuthMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    await ctx.auth.authenticateUsing(['web'], { loginRoute: '/login' })
    if (ctx.auth.user!.role === 'customer' && !ctx.capabilities.customer_accounts.available) {
      await ctx.auth.use('web').logout()
      return ctx.response.redirect().toPath('/login')
    }
    return next()
  }
}
