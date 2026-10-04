import type { HttpContext } from '@adonisjs/core/http'
import { profileValidator } from '#domains/customers/validators/auth'
import { validationMessages } from '#core/support/validation_messages'

export default class ProfileController {
  show({ inertia }: HttpContext) {
    return inertia.render('account/profile', {})
  }

  async update(ctx: HttpContext) {
    const { fullName } = await ctx.request.validateUsing(profileValidator, {
      messagesProvider: validationMessages(ctx.locale),
    })
    await ctx.auth.getUserOrFail().merge({ fullName }).save()
    ctx.session.flash('notice', 'account.saved')
    return ctx.response.redirect().toPath('/account')
  }
}
