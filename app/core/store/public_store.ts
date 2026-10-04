import type StoreSetting from '#core/store/store_setting'
import { mediaUrl } from '#core/support/stored_media'

/** Storefront identity. Omits order prefix, stock threshold, and account flags. */
export function publicStore(store: StoreSetting) {
  return {
    name: store.name,
    description: store.description,
    email: store.email,
    phone: store.phone,
    address: store.address,
    logoUrl: store.logoKey ? mediaUrl(store.logoKey) : null,
    faviconUrl: store.faviconKey ? mediaUrl(store.faviconKey) : null,
    website: store.website,
    facebook: store.facebook,
    instagram: store.instagram,
    youtube: store.youtube,
    tiktok: store.tiktok,
    primaryColor: store.primaryColor,
    accentColor: store.accentColor,
    defaultLocale: store.defaultLocale,
    currency: store.currency,
    timezone: store.timezone,
  }
}
