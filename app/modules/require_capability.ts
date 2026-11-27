import { errors } from '@vinejs/vine'
import StoreSetting from '#core/store/store_setting'
import { capabilitiesFor, type CapabilityName } from '#core/capabilities/capabilities'
import { messagesFor } from '#core/support/translations'
import type { Locale } from '#core/support/locale'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'
export function rejectModule(key: string, locale: Locale): never {
  throw new errors.E_VALIDATION_ERROR([
    { field: 'module', rule: key, message: messagesFor(locale).modules[key] },
  ])
}
export async function requireCapability(
  name: CapabilityName,
  locale: Locale,
  trx?: TransactionClientContract
) {
  const query = StoreSetting.query(trx ? { client: trx } : {})
  if (trx) query.forShare()
  const store = await query.where('id', 1).firstOrFail()
  if (!capabilitiesFor(store)[name].available) rejectModule('disabled', locale)
  return store
}
