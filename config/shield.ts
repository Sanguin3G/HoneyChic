import { defineConfig } from '@adonisjs/shield'
import app from '@adonisjs/core/services/app'
export default defineConfig({
  csp: {
    enabled: app.inProduction,
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", '@nonce'],
      // Vue's v-show and positioned controls use style attributes; scripts remain strict.
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:'],
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
