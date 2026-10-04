import env from '#start/env'
import app from '@adonisjs/core/services/app'
import { defineConfig, targets } from '@adonisjs/core/logger'

export default defineConfig({
  default: 'app',
  loggers: {
    app: {
      enabled: true,
      name: 'honeychic',
      level: env.get('LOG_LEVEL'),
      redact: [
        '*.password',
        '*.passwordConfirmation',
        '*.apiKey',
        '*.secret',
        'req.body',
        'request.body',
        'password',
        'token',
        'authorization',
        'cookie',
        'req.headers.authorization',
        'req.headers.cookie',
      ],
      transport: app.inProduction ? undefined : { targets: [targets.pretty()] },
    },
  },
})
