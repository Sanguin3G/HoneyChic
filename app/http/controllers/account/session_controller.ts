import type { HttpContext } from '@adonisjs/core/http'
import User from '#domains/customers/models/user'
import { loginValidator } from '#domains/customers/validators/auth'
import { validationMessages } from '#core/support/validation_messages'
import { messagesFor } from '#core/support/translations'
import { errors } from '@vinejs/vine'

export default class SessionController {
  show({ inertia, store, capabilities }: HttpContext) {
    return inertia.render('account/login', {
      canRegister: capabilities.customer_accounts.available && store.registrationEnabled,
    })
  }

  async store(ctx: HttpContext) {
    const { email, password } = await ctx.request.validateUsing(loginValidator, {
      messagesProvider: validationMessages(ctx.locale),
    })
    let user: User
    try {
      user = await User.verifyCredentials(email, password)
    } catch (error) {
      if ((error as { code?: string }).code !== 'E_INVALID_CREDENTIALS') throw error
      throw new errors.E_VALIDATION_ERROR([
        {
          field: 'email',
          rule: 'credentials',
          message: messagesFor(ctx.locale).auth.invalidCredentials,
        },
      ])
    }
    if (user.role === 'customer' && !ctx.capabilities.customer_accounts.available) {
      throw new errors.E_VALIDATION_ERROR([
        {
          field: 'email',
          rule: 'disabled',
          message: messagesFor(ctx.locale).auth.accountsDisabled,
        },
      ])
    }
    await ctx.auth.use('web').login(user)
    return ctx.response.redirect().toPath(user.role === 'customer' ? '/account' : '/admin')
  }

  async destroy({ auth, response }: HttpContext) {
    await auth.use('web').logout()
    return response.redirect().toPath('/')
  }
}
