import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { cartFixture } from '../support/cart_fixture.js'
test.group('Public metadata and safe preview indexing', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())
  test('product structured data uses exact prices and cannot close its script element', async ({
    client,
    assert,
  }) => {
    const fixture = await cartFixture()
    await fixture.product
      .merge({ description: '</script><script>alert("merchant")</script>' })
      .save()
    const response = await client.get('/products/' + fixture.product.slug)
    response.assertStatus(200)
    const json = response
      .text()
      .match(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/)?.[1]
    assert.isString(json)
    assert.notInclude(json!, '</script>')
    const data = JSON.parse(json!)
    assert.equal(data['@graph'][0]['@type'], 'Product')
    assert.equal(data['@graph'][0].offers[0].price, '10.00')
    assert.equal(data['@graph'][0].offers[0].priceCurrency, 'USD')
    assert.include(response.text(), 'rel="canonical"')
    assert.include(response.text(), 'property="og:title"')
    assert.include(response.text(), 'name="twitter:card"')
  })
  test('test/dev robots cannot index previews and sitemap is unavailable', async ({
    client,
    assert,
  }) => {
    const robots = await client.get('/robots.txt')
    robots.assertStatus(200)
    assert.equal(robots.text().trim(), 'User-agent: *\nDisallow: /')
    const sitemap = await client.get('/sitemap.xml')
    sitemap.assertStatus(404)
  })
})
