import { Bouncer } from '@adonisjs/bouncer'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import * as abilities from '#policies/admin'

export default class InitializeBouncerMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    ctx.bouncer = new Bouncer(() => ctx.auth.user ?? null, abilities, {})
    return next()
  }
}

declare module '@adonisjs/core/http' {
  interface HttpContext {
    bouncer: Bouncer<NonNullable<HttpContext['auth']['user']>, typeof abilities, {}>
  }
}
