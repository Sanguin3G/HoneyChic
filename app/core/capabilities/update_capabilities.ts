import type { TransactionClientContract } from '@adonisjs/lucid/types/database'
import StoreSetting from '#core/store/store_setting'
import type { moduleFlags } from '#core/capabilities/capabilities'
type Flags = (typeof moduleFlags)[keyof typeof moduleFlags]
export default class UpdateCapabilities {
  async execute(
    input: {
      guestCheckoutEnabled: boolean
      customerAccountsEnabled: boolean
      registrationEnabled: boolean
    } & Partial<Record<Flags, boolean>>,
    trx?: TransactionClientContract
  ) {
    const query = StoreSetting.query(trx ? { client: trx } : {}).where('id', 1)
    if (trx) query.forUpdate()
    const store = await query.firstOrFail()
    if (trx) store.useTransaction(trx)
    return store.merge(input).save()
  }
}
