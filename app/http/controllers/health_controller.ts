import db from '@adonisjs/lucid/services/db'
import type { HttpContext } from '@adonisjs/core/http'

export default class HealthController {
  live() {
    return { status: 'ok' }
  }

  async ready({ response, logger }: HttpContext) {
    try {
      await db.rawQuery('select 1')
      return { status: 'ready' }
    } catch {
      logger.warn('Database readiness check failed')
      return response.serviceUnavailable({ status: 'unavailable' })
    }
  }
}
