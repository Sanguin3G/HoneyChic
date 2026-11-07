import type { moduleFlags } from '#core/capabilities/capabilities'

type Flags = (typeof moduleFlags)[keyof typeof moduleFlags]

export const storeProfiles = ['simple_seller', 'standard_store', 'catalog_only', 'custom'] as const

export type StoreProfile = (typeof storeProfiles)[number]

export type ProfileFlags = {
  guestCheckoutEnabled: boolean
  customerAccountsEnabled: boolean
  registrationEnabled: boolean
} & Record<Flags, boolean>

const closed = {
  reviewsEnabled: false,
  wishlistEnabled: false,
  couponsEnabled: false,
  shippingEnabled: false,
  codEnabled: false,
  fakePaymentEnabled: false,
} as const

/** Named presets write installed flags only. Custom is handled by the caller and writes none. */
export const profileFlags = {
  simple_seller: {
    guestCheckoutEnabled: true,
    customerAccountsEnabled: true,
    registrationEnabled: true,
    ...closed,
  },
  standard_store: {
    guestCheckoutEnabled: true,
    customerAccountsEnabled: true,
    registrationEnabled: true,
    reviewsEnabled: true,
    wishlistEnabled: true,
    couponsEnabled: true,
    shippingEnabled: true,
    codEnabled: false,
    fakePaymentEnabled: false,
  },
  catalog_only: {
    guestCheckoutEnabled: false,
    customerAccountsEnabled: false,
    registrationEnabled: false,
    ...closed,
  },
} as const satisfies Record<Exclude<StoreProfile, 'custom'>, ProfileFlags>
