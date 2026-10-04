import { defineConfig } from '@adonisjs/shield'
import app from '@adonisjs/core/services/app'
import env from '#start/env'

function imageSources() {
  const sources = ["'self'", 'data:']
  if (env.get('DRIVE_DISK') !== 's3') return sources
  const publicUrl = env.get('S3_PUBLIC_URL')
  if (!publicUrl) return sources
  const origin = new URL(publicUrl).origin
  if (!sources.includes(origin)) sources.push(origin)
  return sources
}

export default defineConfig({
  csp: {
    enabled: app.inProduction,
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", '@nonce'],
      // Vue's v-show and positioned controls use style attributes; scripts remain strict.
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: imageSources(),
      fontSrc: ["'self'"],
      connectSrc: ["'self'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
    },
    reportOnly: false,
  },
  csrf: {
    enabled: true,
    exceptRoutes: [],
    enableXsrfCookie: true,
    methods: ['POST', 'PUT', 'PATCH', 'DELETE'],
  },
  xFrame: { enabled: true, action: 'DENY' },
  hsts: { enabled: app.inProduction, maxAge: '180 days' },
  contentTypeSniffing: { enabled: true },
})
