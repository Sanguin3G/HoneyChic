import StoreSetting from '#core/store/store_setting'
import type { Infer } from '@vinejs/vine/types'
import type { settingsValidator } from '#core/store/settings_validator'

const optionalKeys = [
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
  async execute(input: Infer<typeof settingsValidator>) {
    const store = await StoreSetting.findOrFail(1)
    const patch = {
      ...input,
      description: input.description ?? '',
      address: input.address ?? '',
    }
    for (const key of optionalKeys) {
      if (patch[key] === undefined) delete patch[key]
    }
    return store.merge(patch).save()
  }
}
