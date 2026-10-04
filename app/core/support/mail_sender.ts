import env from '#start/env'
import type StoreSetting from '#core/store/store_setting'

export function mailFrom(store: Pick<StoreSetting, 'email' | 'name'>) {
  if (!env.get('SMTP_HOST')) return null
  const address = store.email?.trim() || env.get('MAIL_FROM_ADDRESS')?.trim() || ''
  if (!address.includes('@')) return null
  return { address, name: env.get('MAIL_FROM_NAME')?.trim() || store.name }
}
