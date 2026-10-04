export const supportedLocales = ['en', 'vi'] as const
export type Locale = (typeof supportedLocales)[number]

export function asLocale(value: unknown): Locale | undefined {
  return supportedLocales.find((locale) => locale === value)
}

function browserLocale(header: string): Locale | undefined {
  const preferences = header.split(',').map((part, index) => {
    const [tag, ...parameters] = part.trim().split(';')
    const quality = parameters.find((value) => value.trim().startsWith('q='))
    const weight = quality ? Number(quality.trim().slice(2)) : 1
    return { locale: asLocale(tag.toLowerCase().split('-')[0]), weight, index }
  })
  return preferences
    .filter(
      (item) => item.locale && Number.isFinite(item.weight) && item.weight > 0 && item.weight <= 1
    )
    .sort((a, b) => b.weight - a.weight || a.index - b.index)[0]?.locale
}

export function resolveLocale(options: {
  selected?: unknown
  userPreference?: unknown
  acceptLanguage?: string
  storeDefault?: unknown
}): Locale {
  return (
    asLocale(options.selected) ??
    asLocale(options.userPreference) ??
    browserLocale(options.acceptLanguage ?? '') ??
    asLocale(options.storeDefault) ??
    'en'
  )
}
