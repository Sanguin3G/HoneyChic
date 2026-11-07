import type { HttpContext } from '@adonisjs/core/http'
import StoreSetting from '#core/store/store_setting'
import { mailFrom } from '#core/support/mail_sender'
import RegisterCustomer from '#domains/customers/actions/register_customer'
import RequestEmailVerification from '#domains/customers/actions/request_email_verification'
import { registrationValidator } from '#domains/customers/validators/auth'
import { validationMessages } from '#core/support/validation_messages'
import { messagesFor } from '#core/support/translations'
import { errors } from '@vinejs/vine'

export default class RegistrationController {
  private allowed(ctx: HttpContext) {
    return ctx.capabilities.customer_accounts.available && ctx.store.registrationEnabled
  }

  show(ctx: HttpContext) {
    if (!this.allowed(ctx)) return ctx.response.notFound()
    return ctx.inertia.render('account/register', {})
  }

  async store(ctx: HttpContext) {
    if (!this.allowed(ctx)) return ctx.response.forbidden()
    const input = await ctx.request.validateUsing(registrationValidator, {
      messagesProvider: validationMessages(ctx.locale),
    })
    const store = await StoreSetting.findOrFail(1)
    const verify = mailFrom(store) !== null
    let user
    try {
      user = await new RegisterCustomer().execute(input, ctx.locale, verify)
    } catch (error) {
      if ((error as { code?: string }).code !== '23505') throw error
      throw new errors.E_VALIDATION_ERROR([
        {
          field: 'email',
          rule: 'unique',
          message: messagesFor(ctx.locale).validation.unique,
        },
      ])
    }
    if (verify) {
      await new RequestEmailVerification().execute(user.email, ctx.locale)
      ctx.session.flash('notice', 'auth.verifySent')
      return ctx.response.redirect().toPath('/login')
    }
    await ctx.auth.use('web').login(user)
    return ctx.response.redirect().toPath('/account')
  }
}
