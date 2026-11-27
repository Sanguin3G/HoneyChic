import type { HttpContext } from '@adonisjs/core/http'
import { adminDashboard } from '#domains/orders/queries/admin_dashboard'
export default class DashboardController {
  async index(ctx: HttpContext) {
    return ctx.inertia.render('admin/overview', {
      dashboard: await adminDashboard(ctx.store.lowStockThreshold),
    })
  }
}
