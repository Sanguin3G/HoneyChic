import type { TransactionClientContract } from '@adonisjs/lucid/types/database'
import StoreSetting from '#core/store/store_setting'
import { matchesProfile } from '#core/capabilities/store_profiles'
import type { Infer } from '@vinejs/vine/types'
import type { settingsValidator } from '#core/store/settings_validator'

const optionalKeys = [
  'guestCheckoutEnabled',
  'logoKey',
  'faviconKey',
  'website',
  'facebook',
  'instagram',
  'youtube',
  'tiktok',
  'primaryColor',
  'accentColor',
] as const

export default class UpdateStoreSettings {
  async execute(input: Infer<typeof settingsValidator>, trx?: TransactionClientContract) {
    const query = StoreSetting.query(trx ? { client: trx } : {}).where('id', 1)
    if (trx) query.forUpdate()
    const store = await query.firstOrFail()
    if (trx) store.useTransaction(trx)
    const patch = {
      ...input,
      description: input.description ?? '',
      address: input.address ?? '',
    }
    for (const key of optionalKeys) {
      if (patch[key] === undefined) delete patch[key]
    }
    store.merge(patch)
    if (store.storeProfile !== 'custom' && !matchesProfile(store, store.storeProfile)) {
      store.storeProfile = 'custom'
    }
    return store.save()
  }
}
