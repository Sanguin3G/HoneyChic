import type { HttpContext } from '@adonisjs/core/http'
import { readSecretLink } from '#core/support/secret_link'
import OpenGuestRecovery from '#domains/orders/actions/open_guest_recovery'

export default class OrderRecoveryController {
  async open(ctx: HttpContext) {
    const link = readSecretLink(ctx.params)
    const order = link ? await new OpenGuestRecovery().execute(link.id, link.secret) : null
    if (!order) return ctx.response.notFound()
    ctx.session.put('guestOrder', order.publicId)
    return ctx.response.redirect().toPath('/orders/' + order.publicId)
  }
}
