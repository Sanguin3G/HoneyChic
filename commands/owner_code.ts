import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'

export default class OwnerCode extends BaseCommand {
  static commandName = 'owner:code'
  static description = 'Print the setup code used to create the first owner at /welcome'
  static options: CommandOptions = { startApp: true }

  async run() {
    const { firstRunCode } = await import('#domains/customers/first_run_code')
    this.logger.info(`Open /welcome and enter: ${firstRunCode()}`)
  }
}
