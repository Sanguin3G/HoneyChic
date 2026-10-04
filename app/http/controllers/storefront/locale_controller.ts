import vine from '@vinejs/vine'
import type { HttpContext } from '@adonisjs/core/http'
import { validationMessages } from '#core/support/validation_messages'
const validator = vine.create({
  locale: vine.enum(['en', 'vi']),
  destination: vine.string().maxLength(1000).optional(),
})
const allowed =
  /^(?:\/(?:account|admin(?:\/inventory(?:\/\d+)?|\/settings|\/categories|\/products(?:\/create|\/\d+\/edit)?)?|login|register|cart|products(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)?)?)$/
const commercePaths =
  /^(?:\/checkout|\/orders\/[0-9a-f-]{36}|\/account\/(?:orders|addresses|wishlist)|\/admin\/(?:modules|module-configuration|orders(?:\/[0-9a-f-]{36})?|customers(?:\/\d+)?))$/
function destinationPath(destination: string) {
  const legacy: Record<string, string> = {
    home: '/',
    account: '/account',
    admin: '/admin',
    settings: '/admin/settings',
    login: '/login',
    register: '/register',
  }
  const path = Object.hasOwn(legacy, destination) ? legacy[destination] : destination
  if (!path.startsWith('/') || path.startsWith('//')) return '/'
  let url: URL
  try {
    url = new URL(path, 'http://honeychic.local')
  } catch {
    return '/'
  }
  if (
    url.origin !== 'http://honeychic.local' ||
    (!allowed.test(url.pathname) && !commercePaths.test(url.pathname))
  )
    return '/'
  const query = new URLSearchParams()
  if (
    [
      '/products',
      '/admin/products',
      '/admin/inventory',
      '/admin/orders',
      '/admin/customers',
      '/account/orders',
    ].includes(url.pathname) ||
    /^\/admin\/inventory\/\d+$/.test(url.pathname)
  ) {
    for (const [key, value] of url.searchParams) {
      if (key === 'q' && value.length <= 200) query.set(key, value)
      if (key === 'category' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value) && value.length <= 140)
        query.set(key, value)
      if (key === 'inStock' && value === '1') query.set(key, value)
      if (
        key === 'status' &&
        ['pending', 'processing', 'shipped', 'completed', 'cancelled'].includes(value)
      )
        query.set(key, value)
      if (key === 'state' && ['all', 'low', 'out', 'retired'].includes(value)) query.set(key, value)
      if (key === 'page' && /^[1-9]\d{0,5}$/.test(value) && Number(value) <= 100000)
        query.set(key, value)
    }
  }
  return url.pathname + (query.size ? '?' + query.toString() : '')
}
export default class LocaleController {
  async update(ctx: HttpContext) {
    const { locale, destination = '/' } = await ctx.request.validateUsing(validator, {
      messagesProvider: validationMessages(ctx.locale),
    })
    ctx.session.put('locale', locale)
    if (ctx.auth.user) await ctx.auth.user.merge({ preferredLocale: locale }).save()
    return ctx.response.redirect().toPath(destinationPath(destination))
  }
}
