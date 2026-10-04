import StoreSetting from '#core/store/store_setting'
import type { moduleFlags } from '#core/capabilities/capabilities'
type Flags = (typeof moduleFlags)[keyof typeof moduleFlags]
export default class UpdateCapabilities {
  async execute(
    input: {
      guestCheckoutEnabled: boolean
      customerAccountsEnabled: boolean
      registrationEnabled: boolean
    } & Partial<Record<Flags, boolean>>
  ) {
    const store = await StoreSetting.findOrFail(1)
    return store.merge(input).save()
  }
}
