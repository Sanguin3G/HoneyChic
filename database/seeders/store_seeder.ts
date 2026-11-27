import { BaseSeeder } from '@adonisjs/lucid/seeders'
import StoreSetting from '#core/store/store_setting'
import { defaultStoreRow } from '#core/store/store_config'

export default class extends BaseSeeder {
  async run() {
    await StoreSetting.firstOrCreate({ id: 1 }, defaultStoreRow)
  }
}
