import type { HttpContext } from '@adonisjs/core/http'
import { accessAdmin } from '#policies/admin'
import { adminDashboard } from '#domains/orders/queries/admin_dashboard'
export default class DashboardController {
  async index(ctx: HttpContext) {
    await ctx.bouncer.authorize(accessAdmin)
    return ctx.inertia.render('admin/overview', {
      dashboard: await adminDashboard(ctx.store.lowStockThreshold),
    })
  }
}
