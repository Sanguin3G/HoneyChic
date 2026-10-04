import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import { resolveLocale, type Locale } from '#core/support/locale'
import { storeConfig } from '#core/store/store_config'

export default class LocaleMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    ctx.locale = resolveLocale({
      selected: ctx.session.get('locale'),
      userPreference: ctx.auth.user?.preferredLocale,
      acceptLanguage: ctx.request.header('accept-language'),
      storeDefault: ctx.store?.defaultLocale ?? storeConfig.defaultLocale,
    })
    ctx.view.share({ locale: ctx.locale })
    ctx.response.header('Content-Language', ctx.locale)
    return next()
  }
}

declare module '@adonisjs/core/http' {
  interface HttpContext {
    locale: Locale
  }
}
