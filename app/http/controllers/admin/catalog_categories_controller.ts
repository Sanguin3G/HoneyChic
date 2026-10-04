import type { HttpContext } from '@adonisjs/core/http'
import Category from '#domains/catalog/models/category'
import { accessAdmin } from '#policies/admin'
import { categoryValidator } from '#domains/catalog/validators/catalog'
import SaveCategory from '#domains/catalog/actions/save_category'
import { validationMessages } from '#core/support/validation_messages'
import { rejectCatalog } from '#domains/catalog/errors/reject_catalog'

export default class CatalogCategoriesController {
  async index(ctx: HttpContext) {
    await ctx.bouncer.authorize(accessAdmin)
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
    await ctx.bouncer.authorize(accessAdmin)
    const input = await ctx.request.validateUsing(categoryValidator, {
      messagesProvider: validationMessages(ctx.locale),
    })
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
