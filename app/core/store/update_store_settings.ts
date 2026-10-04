import StoreSetting from '#core/store/store_setting'
import type { Infer } from '@vinejs/vine/types'
import type { settingsValidator } from '#core/store/settings_validator'

export default class UpdateStoreSettings {
  async execute(input: Infer<typeof settingsValidator>) {
    const store = await StoreSetting.findOrFail(1)
    return store
      .merge({ ...input, description: input.description ?? '', address: input.address ?? '' })
      .save()
  }
}
