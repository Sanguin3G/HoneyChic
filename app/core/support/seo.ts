import env from '#start/env'
import { decimalPrice } from '#shared/money'
import type { productDetail } from '#domains/catalog/data/product_data'
export const publicOrigin = new URL(env.get('APP_URL')).origin
export const indexingEnabled =
  env.get('NODE_ENV') === 'production' && (env.get('SEO_INDEXABLE') ?? false)
export function absoluteUrl(path: string) {
  return new URL(path, publicOrigin).href
}
export function escapeXml(value: string) {
  return value.replace(
    /[<>&"']/g,
    (character) =>
      ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[character]!
  )
}
export function productStructuredData(
  product: ReturnType<typeof productDetail>,
  storeName: string
) {
  const url = absoluteUrl('/products/' + product.slug)
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    'name': product.name,
    'description': product.description,
    url,
    'image': product.images.map((image) => absoluteUrl(image.url)),
    'offers': product.variants.map((variant) => ({
      '@type': 'Offer',
      'sku': variant.sku,
      url,
      'priceCurrency': variant.currency,
      'price': decimalPrice(variant.priceMinor, variant.currency),
      'availability': 'https://schema.org/' + (variant.available ? 'InStock' : 'OutOfStock'),
      'seller': { '@type': 'Organization', 'name': storeName },
    })),
  }
  return {
    '@context': 'https://schema.org',
    '@graph': [
      schema,
      {
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': storeName, 'item': absoluteUrl('/') },
          { '@type': 'ListItem', 'position': 2, 'name': product.name, 'item': url },
        ],
      },
    ],
  }
}
