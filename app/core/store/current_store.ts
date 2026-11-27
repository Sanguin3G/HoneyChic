import StoreSetting from '#core/store/store_setting'
import { defaultStoreRow } from '#core/store/store_config'

/** Reads the single store row, creating it from the environment defaults on first run. */
export async function currentStore() {
  const existing = await StoreSetting.find(1)
  if (existing) return existing
  try {
    return await StoreSetting.create({ id: 1, ...defaultStoreRow })
  } catch {
    // Another first request created it at the same moment.
    return StoreSetting.findOrFail(1)
  }
}
