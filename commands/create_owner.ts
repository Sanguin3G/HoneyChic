import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'

export default class CreateOwner extends BaseCommand {
  static commandName = 'owner:create'
  static description = 'Create the initial store owner using secure interactive prompts'
  static options: CommandOptions = { startApp: true }

  async run() {
    const { default: CreateInitialOwner } =
      await import('#domains/customers/actions/create_initial_owner')
    const { registrationValidator } = await import('#domains/customers/validators/auth')
    const fullName = await this.prompt.ask('Owner name')
    const email = await this.prompt.ask('Owner email')
    const password = await this.prompt.secure('Password (at least 12 characters)')
    const passwordConfirmation = await this.prompt.secure('Confirm password')
    const input = await registrationValidator.validate({
      fullName,
      email,
      password,
      password_confirmation: passwordConfirmation,
    })
    const owner = await new CreateInitialOwner().execute(input)
    if (!owner) {
      this.logger.error('An owner already exists. This command cannot replace or add an owner.')
      this.exitCode = 1
      return
    }
    this.logger.success('Owner created. Sign in at /login.')
  }
}
