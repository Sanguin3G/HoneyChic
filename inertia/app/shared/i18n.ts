import { usePage } from '@inertiajs/vue3'
import { computed } from 'vue'

export type Locale = 'en' | 'vi'
export interface CapabilityState {
  installed: boolean
  enabled: boolean
  configured: boolean
  available: boolean
}
export type SharedProps = {
  seo: { origin: string; indexable: boolean }
  cartQuantity: number
  locale: Locale
  messages: Record<string, Record<string, string>>
  store: {
    name: string
    description?: string
    email?: string | null
    phone?: string | null
    address?: string
    logoUrl?: string | null
    faviconUrl?: string | null
    website?: string | null
    facebook?: string | null
    instagram?: string | null
    youtube?: string | null
    tiktok?: string | null
    primaryColor?: string | null
    accentColor?: string | null
    defaultLocale: Locale
    currency: string
    timezone: string
  }
  auth: { id: number; fullName: string; email: string; role: 'owner' | 'staff' | 'customer' } | null
  capabilities: Record<string, CapabilityState>
  permissions: { admin: boolean; manageStore: boolean }
  notice: string | null
}

export function useI18n() {
  const page = usePage<SharedProps>()
  return {
    locale: computed(() => page.props.locale),
    t(namespace: string, key: string): string {
      return page.props.messages[namespace]?.[key] ?? `${namespace}.${key}`
    },
    message(key: string): string {
      const [namespace, ...parts] = key.split('.')
      return page.props.messages[namespace]?.[parts.join('.')] ?? key
    },
  }
}
