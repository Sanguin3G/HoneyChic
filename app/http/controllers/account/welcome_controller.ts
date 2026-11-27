import type { HttpContext } from '@adonisjs/core/http'
import logger from '@adonisjs/core/services/logger'
import app from '@adonisjs/core/services/app'
import vine, { errors } from '@vinejs/vine'
import User from '#domains/customers/models/user'
import CreateInitialOwner from '#domains/customers/actions/create_initial_owner'
import { firstRunCode, matchesFirstRunCode } from '#domains/customers/first_run_code'
import { messagesFor } from '#core/support/translations'

const welcomeValidator = vine.create({
  fullName: vine.string().trim().minLength(1).maxLength(120),
  email: vine.string().trim().toLowerCase().email().maxLength(254),
  password: vine.string().minLength(12).maxLength(128).confirmed(),
  setupCode: vine.string().trim().maxLength(20),
})

let codeLogged = false

/** First run only: creates the owner from the browser when no owner exists yet. */
export default class WelcomeController {
  private async hasOwner() {
    return !!(await User.query().where('role', 'owner').first())
  }

  async show(ctx: HttpContext) {
    if (await this.hasOwner()) return ctx.response.redirect().toPath('/login')
    if (!codeLogged) {
      logger.warn(`HoneyChic first-run setup code: ${firstRunCode()}`)
      codeLogged = true
    }
    return ctx.inertia.render('account/welcome', {
      developmentCode: app.inProduction ? null : firstRunCode(),
    })
  }

  async store(ctx: HttpContext) {
    const input = await ctx.request.validateUsing(welcomeValidator)
    if (!matchesFirstRunCode(input.setupCode)) {
      throw new errors.E_VALIDATION_ERROR([
        {
          field: 'setupCode',
          rule: 'setupCode',
          message: messagesFor(ctx.locale).auth.setupCodeInvalid,
        },
      ])
    }
    const owner = await new CreateInitialOwner().execute(input)
    if (!owner) return ctx.response.redirect().toPath('/login')
    await ctx.auth.use('web').login(owner)
    ctx.session.flash('notice', 'auth.welcomeDone')
    return ctx.response.redirect().toPath('/admin/setup')
  }
}
