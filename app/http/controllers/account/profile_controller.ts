import type { HttpContext } from '@adonisjs/core/http'
import { profileValidator } from '#domains/customers/validators/auth'

export default class ProfileController {
  show({ inertia }: HttpContext) {
    return inertia.render('account/profile', {})
  }

  async update(ctx: HttpContext) {
    const { fullName } = await ctx.request.validateUsing(profileValidator)
    await ctx.auth.getUserOrFail().merge({ fullName }).save()
    ctx.session.flash('notice', 'account.saved')
    return ctx.response.redirect().toPath('/account')
  }
}
