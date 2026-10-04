import type { HttpContext } from '@adonisjs/core/http'
import { publishedProducts } from '#domains/catalog/queries/published_products'
import { absoluteUrl, escapeXml, indexingEnabled } from '#core/support/seo'
const batchSize = 5000
const declaration = '<?xml version="1.0" encoding="UTF-8"?>'
export default class SeoController {
  async robots({ response }: HttpContext) {
    return response
      .type('text/plain')
      .send(
        indexingEnabled
          ? 'User-agent: *\nDisallow: /admin\nDisallow: /account\nDisallow: /cart\nDisallow: /checkout\nDisallow: /orders\nDisallow: /login\nDisallow: /register\nDisallow: /*?\nSitemap: ' +
              absoluteUrl('/sitemap.xml') +
              '\n'
          : 'User-agent: *\nDisallow: /\n'
      )
  }
  async index({ response }: HttpContext) {
    if (!indexingEnabled) return response.notFound()
    const query = publishedProducts().count('* as total')
    const result = await query
    const pages = Math.ceil(Number(result[0].$extras.total) / batchSize)
    const urls = [
      '/sitemap/pages.xml',
      ...Array.from({ length: pages }, (_, page) => '/sitemap/products/' + (page + 1)),
    ]
    return response
      .type('application/xml')
      .send(
        declaration +
          '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
          urls
            .map((path) => '<sitemap><loc>' + escapeXml(absoluteUrl(path)) + '</loc></sitemap>')
            .join('') +
          '</sitemapindex>'
      )
  }
  async pages({ response }: HttpContext) {
    if (!indexingEnabled) return response.notFound()
    return response.type('application/xml').send(this.urlset(['/', '/products'].map(absoluteUrl)))
  }
  async products({ params, response }: HttpContext) {
    if (!indexingEnabled || !/^[1-9]\d{0,5}$/.test(params.page)) return response.notFound()
    const page = Number(params.page)
    const rows = await publishedProducts()
      .orderBy('id')
      .offset((page - 1) * batchSize)
      .limit(batchSize)
    if (!rows.length) return response.notFound()
    return response
      .type('application/xml')
      .send(this.urlset(rows.map((row) => absoluteUrl('/products/' + row.slug))))
  }
  private urlset(urls: string[]) {
    return (
      declaration +
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
      urls.map((url) => '<url><loc>' + escapeXml(url) + '</loc></url>').join('') +
      '</urlset>'
    )
  }
}
