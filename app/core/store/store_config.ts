import env from '#start/env'

// Platform identity belongs to HoneyChic; merchant identity remains configurable.
export const storeConfig = {
  name: env.get('STORE_NAME'),
  defaultLocale: env.get('STORE_DEFAULT_LOCALE'),
  currency: env.get('STORE_CURRENCY'),
  timezone: env.get('STORE_TIMEZONE'),
}

/** The first store row. Created on the first request, so a fresh install needs no seeding. */
export const defaultStoreRow = {
  ...storeConfig,
  description: '',
  address: '',
  orderPrefix: 'HC',
  lowStockThreshold: 5,
  customerAccountsEnabled: true,
  registrationEnabled: true,
}
