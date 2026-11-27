import type { HttpContext } from '@adonisjs/core/http'
import Category from '#domains/catalog/models/category'
import { categoryValidator } from '#domains/catalog/validators'
import SaveCategory from '#domains/catalog/actions/save_category'
import { rejectCatalog } from '#domains/catalog/reject_catalog'

export default class CatalogCategoriesController {
  async index(ctx: HttpContext) {
    const categories = await Category.query().orderBy('name')
    return ctx.inertia.render('admin/catalog/categories', {
      categories: categories.map((row) => ({
        id: row.id,
        name: row.name,
        slug: row.slug,
        description: row.description,
        isActive: row.isActive,
      })),
    })
  }

  async store(ctx: HttpContext) {
    return this.save(ctx)
  }

  async update(ctx: HttpContext) {
    return this.save(ctx, Number(ctx.params.id))
  }

  private async save(ctx: HttpContext, id: number | null = null) {
    const input = await ctx.request.validateUsing(categoryValidator)
    try {
      await new SaveCategory().execute(id, input, ctx.locale)
    } catch (error) {
      if ((error as { code?: string }).code === '23505')
        rejectCatalog('slug', 'alreadyUsed', ctx.locale)
      throw error
    }
    ctx.session.flash('notice', 'catalog.saved')
    return ctx.response.redirect().toPath('/admin/categories')
  }
}
