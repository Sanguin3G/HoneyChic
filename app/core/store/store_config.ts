import env from '#start/env'

// Platform identity belongs to HoneyChic; merchant identity remains configurable.
export const storeConfig = {
  name: env.get('STORE_NAME'),
  defaultLocale: env.get('STORE_DEFAULT_LOCALE'),
  currency: env.get('STORE_CURRENCY'),
  timezone: env.get('STORE_TIMEZONE'),
}
