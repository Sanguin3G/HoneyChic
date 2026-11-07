import type { HttpContext } from '@adonisjs/core/http'
import { readSecretLink } from '#core/support/secret_link'
import { validationMessages } from '#core/support/validation_messages'
import { forgotPasswordValidator } from '#domains/customers/validators/auth'
import RequestEmailVerification from '#domains/customers/actions/request_email_verification'
import ConfirmEmail from '#domains/customers/actions/confirm_email'

export default class EmailVerificationController {
  create({ inertia }: HttpContext) {
    return inertia.render('account/verify_resend', {})
  }

  async store(ctx: HttpContext) {
    const { email } = await ctx.request.validateUsing(forgotPasswordValidator, {
      messagesProvider: validationMessages(ctx.locale),
    })
    await new RequestEmailVerification().execute(email, ctx.locale)
    ctx.session.flash('notice', 'auth.verifyResent')
    return ctx.response.redirect().toPath('/login')
  }

  edit(ctx: HttpContext) {
    const link = readSecretLink(ctx.params)
    if (!link) return ctx.response.notFound()
    return ctx.inertia.render('account/verify', link)
  }

  async update(ctx: HttpContext) {
    const link = readSecretLink(ctx.params)
    if (!link) return ctx.response.notFound()
    const confirmed = await new ConfirmEmail().execute(link.id, link.secret)
    if (!confirmed) {
      ctx.session.flash('notice', 'auth.verifyInvalid')
      return ctx.response.redirect().toPath(`/email/verify/${link.id}/${link.secret}`)
    }
    ctx.session.flash('notice', 'auth.verifyDone')
    return ctx.response.redirect().toPath('/login')
  }
}
