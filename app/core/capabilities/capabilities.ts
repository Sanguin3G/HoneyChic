import env from '#start/env'
import type StoreSetting from '#core/store/store_setting'
export const moduleFlags = {
  'reviews': 'reviewsEnabled',
  'wishlist': 'wishlistEnabled',
  'coupons': 'couponsEnabled',
  'shipping': 'shippingEnabled',
  'payments.cod': 'codEnabled',
  'payments.fake': 'fakePaymentEnabled',
} as const
const names = [
  'customer_accounts',
  'guest_checkout',
  ...Object.keys(moduleFlags),
  'payments.stripe',
  'payments.vnpay',
  'assistant',
] as const
export type CapabilityName =
  | 'customer_accounts'
  | 'guest_checkout'
  | keyof typeof moduleFlags
  | 'payments.stripe'
  | 'payments.vnpay'
  | 'assistant'
export type CapabilityState = {
  installed: boolean
  enabled: boolean
  configured: boolean
  available: boolean
}
type Settings = Pick<StoreSetting, 'customerAccountsEnabled'> &
  Partial<
    Pick<StoreSetting, 'guestCheckoutEnabled' | (typeof moduleFlags)[keyof typeof moduleFlags]>
  >
/** Installation is code; preferences cannot install providers. Fake payments never run in production. */
export function capabilitiesFor(store: Settings) {
  return Object.fromEntries(
    names.map((name) => {
      const flag = moduleFlags[name as keyof typeof moduleFlags]
      const installed = name === 'customer_accounts' || name === 'guest_checkout' || !!flag
      const enabled =
        name === 'customer_accounts'
          ? store.customerAccountsEnabled
          : name === 'guest_checkout'
            ? (store.guestCheckoutEnabled ?? true)
            : !!(flag && store[flag])
      const configured =
        installed &&
        (name !== 'payments.fake' || env.get('NODE_ENV') !== 'production') &&
        ((name !== 'wishlist' && name !== 'reviews') || store.customerAccountsEnabled)
      return [
        name,
        { installed, enabled, configured, available: installed && enabled && configured },
      ]
    })
  ) as Record<CapabilityName, CapabilityState>
}
