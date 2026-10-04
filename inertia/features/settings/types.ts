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
}
