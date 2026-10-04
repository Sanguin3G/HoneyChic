import type { HttpContext } from '@adonisjs/core/http'
import { readSecretLink } from '#core/support/secret_link'
import { validationMessages } from '#core/support/validation_messages'
import RequestPasswordReset from '#domains/customers/actions/request_password_reset'
import ResetPassword from '#domains/customers/actions/reset_password'
import { forgotPasswordValidator, resetPasswordValidator } from '#domains/customers/validators/auth'

export default class PasswordResetController {
  create({ inertia }: HttpContext) {
    return inertia.render('account/forgot', {})
  }

  async store(ctx: HttpContext) {
    const { email } = await ctx.request.validateUsing(forgotPasswordValidator, {
      messagesProvider: validationMessages(ctx.locale),
    })
    await new RequestPasswordReset().execute(email, ctx.locale)
    ctx.session.flash('notice', 'auth.resetSent')
    return ctx.response.redirect().toPath('/login')
  }

  edit(ctx: HttpContext) {
    const link = readSecretLink(ctx.params)
    if (!link) return ctx.response.notFound()
    return ctx.inertia.render('account/reset', link)
  }

  async update(ctx: HttpContext) {
    const link = readSecretLink(ctx.params)
    if (!link) return ctx.response.notFound()
    const { password } = await ctx.request.validateUsing(resetPasswordValidator, {
      messagesProvider: validationMessages(ctx.locale),
    })
    const updated = await new ResetPassword().execute(link.id, link.secret, password)
    if (!updated) {
      ctx.session.flash('notice', 'auth.resetInvalid')
      return ctx.response.redirect().toPath(`/password/reset/${link.id}/${link.secret}`)
    }
    await ctx.auth.use('web').logout()
    ctx.session.flash('notice', 'auth.resetDone')
    return ctx.response.redirect().toPath('/login')
  }
}
