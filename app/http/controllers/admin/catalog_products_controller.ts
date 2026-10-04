import type { HttpContext } from '@adonisjs/core/http'
import Category from '#domains/catalog/models/category'
import { accessAdmin } from '#policies/admin'
import {
  productValidator,
  productImageValidator,
  catalogQueryValidator,
} from '#domains/catalog/validators/catalog'
import ProductImage from '#domains/catalog/models/product_image'
import { mediaUrl, releaseUnusedUploads } from '#core/support/stored_media'
import { storePublicImage } from '#core/support/store_public_image'
import { validationMessages } from '#core/support/validation_messages'
import { rejectCatalog } from '#domains/catalog/errors/reject_catalog'
import CreateProduct from '#domains/catalog/actions/create_product'
import UpdateProduct from '#domains/catalog/actions/update_product'
import SearchCatalog from '#domains/catalog/queries/search_catalog'
import { loadProduct } from '#domains/catalog/queries/load_product'
import { productEditor, productSummary } from '#domains/catalog/data/product_data'

export default class CatalogProductsController {
  async index(ctx: HttpContext) {
    await ctx.bouncer.authorize(accessAdmin)
    const filters = await ctx.request.validateUsing(catalogQueryValidator, {
      messagesProvider: validationMessages(ctx.locale),
    })
    const result = await new SearchCatalog().query(filters, true).paginate(filters.page ?? 1, 20)
    return ctx.inertia.render('admin/catalog/products', {
      products: result.all().map(productSummary),
      filters: { q: filters.q ?? '' },
      pagination: { page: result.currentPage, lastPage: result.lastPage, total: result.total },
    })
  }

  async create(ctx: HttpContext) {
    await ctx.bouncer.authorize(accessAdmin)
    const categories = await Category.query().orderBy('name')
    return ctx.inertia.render('admin/catalog/edit_product', {
      productId: null,
      currency: ctx.store.currency,
      product: null,
      categories: categories.map((row) => ({
        id: row.id,
        name: row.name,
      })),
    })
  }

  async edit(ctx: HttpContext) {
    await ctx.bouncer.authorize(accessAdmin)
    const product = await loadProduct(Number(ctx.params.id))
    const categories = await Category.query().orderBy('name')
    return ctx.inertia.render('admin/catalog/edit_product', {
      productId: product.id,
      currency: product.variants[0].currency,
      product: productEditor(product),
      categories: categories.map((row) => ({
        id: row.id,
        name: row.name,
      })),
    })
  }

  async store(ctx: HttpContext) {
    return this.save(ctx)
  }

  async storeImage(ctx: HttpContext) {
    await ctx.bouncer.authorize(accessAdmin)
    const { image } = await ctx.request.validateUsing(productImageValidator, {
      messagesProvider: validationMessages(ctx.locale),
    })
    const storageKey = await storePublicImage(image)
    return { storageKey, url: mediaUrl(storageKey) }
  }

  async update(ctx: HttpContext) {
    return this.save(ctx, Number(ctx.params.id))
  }

  private async save(ctx: HttpContext, id?: number) {
    await ctx.bouncer.authorize(accessAdmin)
    const input = await ctx.request.validateUsing(productValidator, {
      messagesProvider: validationMessages(ctx.locale),
    })
    const previousImages = id
      ? await ProductImage.query().where('productId', id).select('storageKey')
      : []
    const previousKeys = previousImages.map((image) => image.storageKey)
    let product
    try {
      product = id
        ? await new UpdateProduct().execute(id, input, ctx.locale)
        : await new CreateProduct().execute(input, ctx.store.currency, ctx.locale)
    } catch (error) {
      const kept = new Set(previousKeys)
      await releaseUnusedUploads(
        input.images.map((image) => image.storageKey).filter((key) => !kept.has(key))
      )
      const failure = error as { code?: string; constraint?: string }
      if (failure.code === '23505') {
        rejectCatalog(
          failure.constraint?.includes('sku') ? 'variants' : 'slug',
          'alreadyUsed',
          ctx.locale
        )
      }
      throw error
    }
    await releaseUnusedUploads(previousKeys)
    ctx.session.flash('notice', 'catalog.saved')
    return ctx.response.redirect().toPath('/admin/products/' + product.id + '/edit')
  }
}
