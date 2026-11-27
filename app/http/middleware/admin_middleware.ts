import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import { accessAdmin } from '#policies/admin'

/** Owner and staff only. Owner-only screens still authorize `manageStore` themselves. */
export default class AdminMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    await ctx.bouncer.authorize(accessAdmin)
    return next()
  }
}
