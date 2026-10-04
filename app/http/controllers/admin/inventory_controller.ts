import type { HttpContext } from '@adonisjs/core/http'
import { accessAdmin } from '#policies/admin'
import ProductVariant from '#domains/catalog/models/product_variant'
import InventoryMovement from '#domains/inventory/models/inventory_movement'
import AdjustInventory from '#domains/inventory/actions/adjust_inventory'
import { listInventory } from '#domains/inventory/queries/list_inventory'
import { inventoryData } from '#domains/inventory/data/inventory_data'
import {
  inventoryAdjustmentValidator,
  inventoryQueryValidator,
  inventoryVariantValidator,
} from '#domains/inventory/validators/inventory'
import { validationMessages } from '#core/support/validation_messages'

export default class InventoryController {
  private async variantId(ctx: HttpContext) {
    const { id } = await inventoryVariantValidator.validate(ctx.params, {
      messagesProvider: validationMessages(ctx.locale),
    })
    return id
  }

  async index(ctx: HttpContext) {
    await ctx.bouncer.authorize(accessAdmin)
    const input = await ctx.request.validateUsing(inventoryQueryValidator, {
      messagesProvider: validationMessages(ctx.locale),
    })
    const result = await listInventory(input, ctx.store.lowStockThreshold).paginate(
      input.page ?? 1,
      20
    )
    return ctx.inertia.render('admin/inventory/index', {
      variants: result.all().map((variant) => inventoryData(variant, ctx.store.lowStockThreshold)),
      filters: { q: input.q ?? '', state: input.state ?? 'all' },
      threshold: ctx.store.lowStockThreshold,
      pagination: { page: result.currentPage, lastPage: result.lastPage, total: result.total },
    })
  }
  async show(ctx: HttpContext) {
    await ctx.bouncer.authorize(accessAdmin)
    const variant = await ProductVariant.query()
      .where('id', await this.variantId(ctx))
      .preload('product')
      .firstOrFail()
    const input = await ctx.request.validateUsing(inventoryQueryValidator, {
      messagesProvider: validationMessages(ctx.locale),
    })
    const result = await InventoryMovement.query()
      .where('productVariantId', variant.id)
      .preload('actor')
      .orderBy('id', 'desc')
      .paginate(input.page ?? 1, 25)
    return ctx.inertia.render('admin/inventory/show', {
      variant: inventoryData(variant, ctx.store.lowStockThreshold),
      movements: result.all().map((row) => ({
        id: row.id,
        quantityDelta: row.quantityDelta,
        stockAfter: row.stockAfter,
        reason: row.reason,
        reference: row.reference,
        note: row.note,
        actor: row.actor?.fullName ?? null,
        createdAt: row.createdAt.toISO(),
      })),
      pagination: { page: result.currentPage, lastPage: result.lastPage, total: result.total },
    })
  }
  async adjust(ctx: HttpContext) {
    await ctx.bouncer.authorize(accessAdmin)
    const input = await ctx.request.validateUsing(inventoryAdjustmentValidator, {
      messagesProvider: validationMessages(ctx.locale),
    })
    await new AdjustInventory().execute(
      { ...input, variantId: await this.variantId(ctx), actorId: ctx.auth.user!.id },
      ctx.locale
    )
    ctx.session.flash('notice', 'inventory.saved')
    return ctx.response.redirect().toPath('/admin/inventory/' + ctx.params.id)
  }
}
