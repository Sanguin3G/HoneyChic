import type { ProductInput } from '#domains/catalog/validators/catalog'
import type { Locale } from '#core/support/locale'
import { rejectCatalog } from '#domains/catalog/errors/reject_catalog'
import { parsePrice } from '#shared/money'

export function validateProductDefinition(input: ProductInput, currency: string, locale: Locale) {
  if (!input.name.trim()) rejectCatalog('name', 'invalidDefinition', locale)
  const optionNames = input.options.map((option) => option.name.trim().toLowerCase())
  if (new Set(optionNames).size !== optionNames.length || optionNames.includes('')) {
    rejectCatalog('options', 'duplicateOptions', locale)
  }
  for (const option of input.options) {
    const values = option.values.map((value) => value.trim().toLowerCase())
    if (new Set(values).size !== values.length || values.includes('')) {
      rejectCatalog('options', 'duplicateValues', locale)
    }
  }
  if (input.options.length === 0 && input.variants.length !== 1) {
    rejectCatalog('variants', 'defaultVariantRequired', locale)
  }
  const combinations = new Set<string>()
  const skus = new Set<string>()
  const ids = new Set<number>()
  const prices = input.variants.map((variant, index) => {
    if (skus.has(variant.sku) || (variant.id && ids.has(variant.id))) {
      rejectCatalog('variants', 'duplicateVariants', locale)
    }
    skus.add(variant.sku)
    if (variant.id) ids.add(variant.id)
    if (
      variant.selections.length !== input.options.length ||
      variant.selections.some((value, position) => !input.options[position].values.includes(value))
    ) {
      rejectCatalog('variants', 'invalidSelection', locale)
    }
    const key = JSON.stringify(variant.selections)
    if (combinations.has(key)) rejectCatalog('variants', 'duplicateVariants', locale)
    combinations.add(key)
    try {
      return parsePrice(variant.price, currency)
    } catch {
      return rejectCatalog('variants.' + index + '.price', 'invalidPrice', locale)
    }
  })
  if (input.images.length && input.images.filter((image) => image.isPrimary).length !== 1) {
    rejectCatalog('images', 'primaryImageRequired', locale)
  }
  if (
    input.images.some((image) => !image.altText.trim()) ||
    new Set(input.images.map((image) => image.storageKey)).size !== input.images.length
  ) {
    rejectCatalog('images', 'invalidImages', locale)
  }
  return prices
}
