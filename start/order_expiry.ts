/*
| Unpaid-order expiry runs inside the web process every ORDER_EXPIRY_MINUTES minutes
| (default 15, 0 turns it off). It does nothing until the owner sets a lifetime in
| Store settings. CancelOrder locks each order, so several replicas running it is safe.
*/
import logger from '@adonisjs/core/services/logger'
import env from '#start/env'

const minutes = env.get('ORDER_EXPIRY_MINUTES') ?? 15
if (minutes > 0) {
  const timer = setInterval(async () => {
    try {
      const { default: ExpireUnpaidOrders } =
        await import('#domains/orders/actions/expire_unpaid_orders')
      const expired = await new ExpireUnpaidOrders().execute()
      if (expired.length) logger.info({ count: expired.length }, 'expired unpaid orders')
    } catch (error) {
      logger.error({ error: error instanceof Error ? error.message : error }, 'order expiry failed')
    }
  }, minutes * 60_000)
  timer.unref()
}
