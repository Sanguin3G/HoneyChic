export interface StoreSettings {
  name: string
  description: string
  email: string | null
  phone: string | null
  address: string
  currency: string
  defaultLocale: 'en' | 'vi'
  timezone: string
  orderPrefix: string
  lowStockThreshold: number
  customerAccountsEnabled: boolean
  registrationEnabled: boolean
  guestCheckoutEnabled: boolean
  logoKey: string | null
  faviconKey: string | null
  logoUrl: string | null
  faviconUrl: string | null
  website: string | null
  facebook: string | null
  instagram: string | null
  youtube: string | null
  tiktok: string | null
  primaryColor: string | null
  accentColor: string | null
}
