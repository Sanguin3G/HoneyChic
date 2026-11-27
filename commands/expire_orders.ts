import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'

export default class ExpireOrders extends BaseCommand {
  static commandName = 'orders:expire'
  static description =
    'Cancel pending unpaid orders older than the store lifetime and restore stock'
  static options: CommandOptions = { startApp: true }

  async run() {
    const { default: ExpireUnpaidOrders } =
      await import('#domains/orders/actions/expire_unpaid_orders')
    const expired = await new ExpireUnpaidOrders().execute()
    this.logger.info(`Expired ${expired.length} unpaid order(s).`)
  }
}
