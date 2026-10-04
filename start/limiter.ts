import limiter from '@adonisjs/limiter/services/main'

// PostgreSQL in development/production; isolated memory store during tests.
export const authThrottle = limiter.define('auth', () =>
  limiter.allowRequests(10).every('1 minute')
)

export const checkoutThrottle = limiter.define('checkout', () =>
  limiter.allowRequests(30).every('1 minute')
)
