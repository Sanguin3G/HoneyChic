import { test } from '@japa/runner'

function pageVersion(html: string): string {
  // Inertia 3 embeds page data in a JSON script, separate from SSR markup.
  const data = html.match(/<script[^>]*data-page="[^"]*"[^>]*>([\s\S]*?)<\/script>/)?.[1]
  if (!data) throw new Error('Missing Inertia page data')
  return JSON.parse(data).version
}

test.group('Foundation smoke', () => {
  test('serves health and connects to PostgreSQL', async ({ client }) => {
    const live = await client.get('/health')
    live.assertStatus(200)
    live.assertBody({ status: 'ok' })
    const ready = await client.get('/health/ready')
    ready.assertStatus(200)
    ready.assertBody({ status: 'ready' })
  })

  test('renders Vietnamese HTML through SSR', async ({ client, assert }) => {
    const response = await client.get('/').header('Accept-Language', 'vi-VN, en;q=0.8')
    response.assertStatus(200)
    response.assertHeader('content-language', 'vi')
    assert.include(response.text(), '<h1')
    assert.include(response.text(), 'Khám phá cửa hàng')
    assert.include(response.text(), 'lang="vi"')
  })

  test('returns an English Inertia page', async ({ client, assert }) => {
    const initial = await client.get('/').header('Accept-Language', 'en')
    const response = await client
      .get('/')
      .header('X-Inertia', 'true')
      .header('X-Inertia-Version', pageVersion(initial.text()))
      .header('Accept-Language', 'en')
    response.assertStatus(200)
    response.assertHeader('x-inertia', 'true')
    assert.equal(response.body().component, 'storefront/home')
    assert.equal(response.body().props.locale, 'en')
  })
})
