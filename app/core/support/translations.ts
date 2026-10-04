import { readFile } from 'node:fs/promises'
import app from '@adonisjs/core/services/app'
import type { Locale } from '#core/support/locale'

const namespaces = [
  'common',
  'navigation',
  'errors',
  'auth',
  'account',
  'settings',
  'capabilities',
  'validation',
  'catalog',
  'inventory',
  'storefront',
  'cart',
  'orders',
  'admin',
  'modules',
] as const
export type Messages = Record<(typeof namespaces)[number], Record<string, string>>

const dictionaries = Object.fromEntries(
  await Promise.all(
    (['en', 'vi'] as const).map(async (locale) => [
      locale,
      Object.fromEntries(
        await Promise.all(
          namespaces.map(async (namespace) => [
            namespace,
            JSON.parse(
              await readFile(app.makePath('resources', 'lang', locale, namespace + '.json'), 'utf8')
            ),
          ])
        )
      ),
    ])
  )
) as Record<Locale, Messages>

export function messagesFor(locale: Locale): Messages {
  return dictionaries[locale]
}
