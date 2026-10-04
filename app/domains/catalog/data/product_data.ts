import type Product from '#domains/catalog/models/product'
import { mediaUrl } from '#core/support/stored_media'
import { decimalPrice } from '#shared/money'

export function productSummary(product: Product) {
  const variant = product.variants[0]
  const image = product.images[0]
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    status: product.status,
    hasVariants: product.variants.length > 1,
    available: product.variants.some((item) => item.stock > 0),
    category: product.category
      ? { name: product.category.name, slug: product.category.slug }
      : null,
    priceMinor: variant?.priceMinor ?? null,
    currency: variant?.currency ?? null,
    image: image ? { url: mediaUrl(image.storageKey), altText: image.altText } : null,
  }
}

export function productDetail(product: Product) {
  return {
    ...productSummary(product),
    description: product.description,
    options: product.options.map((option) => ({
      name: option.name,
      values: option.values.map((value) => value.value),
    })),
    variants: product.variants.map((variant) => ({
      id: variant.id,
      sku: variant.sku,
      priceMinor: variant.priceMinor,
      currency: variant.currency,
      available: variant.stock > 0,
      description: variant.description,
      selections: JSON.parse(variant.combinationKey) as string[],
    })),
    images: product.images.map((image) => ({
      storageKey: image.storageKey,
      altText: image.altText,
      isPrimary: image.isPrimary,
      url: mediaUrl(image.storageKey),
    })),
  }
}

export function productEditor(product: Product) {
  const detail = productDetail(product)
  return {
    name: product.name,
    slug: product.slug,
    description: product.description,
    categoryId: product.categoryId,
    status: product.status,
    options: detail.options,
    variants: detail.variants.map((variant) => ({
      id: variant.id,
      sku: variant.sku,
      price: decimalPrice(variant.priceMinor, variant.currency),
      selections: variant.selections,
    })),
    images: detail.images.map(({ storageKey, altText, isPrimary, url }) => ({
      storageKey,
      altText,
      isPrimary,
      url,
    })),
  }
}
