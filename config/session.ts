import env from '#start/env'
import app from '@adonisjs/core/services/app'
import { defineConfig, stores } from '@adonisjs/session'

export default defineConfig({
  enabled: true,
  cookieName: 'honeychic-session',
  clearWithBrowser: false,
  age: '2h',
  cookie: { path: '/', httpOnly: true, secure: app.inProduction, sameSite: 'lax' },
  store: app.inTest ? 'memory' : env.get('SESSION_DRIVER'),
  stores: { cookie: stores.cookie() },
})
