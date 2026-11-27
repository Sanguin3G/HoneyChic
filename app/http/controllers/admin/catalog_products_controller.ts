import { readFile } from 'node:fs/promises'
import vine from '@vinejs/vine'
import type { HttpContext } from '@adonisjs/core/http'
import ImportProducts, { productsCsv } from '#domains/catalog/product_csv'
import Category from '#domains/catalog/models/category'
import {
  productValidator,
  productImageValidator,
  catalogQueryValidator,
} from '#domains/catalog/validators'
import ProductImage from '#domains/catalog/models/product_image'
import { mediaUrl, releaseUnusedUploads } from '#core/support/stored_media'
import { storePublicImage } from '#core/support/store_public_image'
import { rejectCatalog } from '#domains/catalog/reject_catalog'
import CreateProduct from '#domains/catalog/actions/create_product'
import UpdateProduct from '#domains/catalog/actions/update_product'
import SearchCatalog from '#domains/catalog/queries/search_catalog'
import { loadProduct } from '#domains/catalog/queries/load_product'
import { productEditor, productSummary } from '#domains/catalog/product_data'

const importValidator = vine.create({
  file: vine.file({ size: '2mb', extnames: ['csv', 'txt'] }),
})

export default class CatalogProductsController {
  async index(ctx: HttpContext) {
    const filters = await ctx.request.validateUsing(catalogQueryValidator)
    const result = await new SearchCatalog().query(filters, true).paginate(filters.page ?? 1, 20)
    return ctx.inertia.render('admin/catalog/products', {
      products: result.all().map(productSummary),
      filters: { q: filters.q ?? '' },
      pagination: { page: result.currentPage, lastPage: result.lastPage, total: result.total },
      importResult: ctx.session.flashMessages.get('importResult') ?? null,
    })
  }

  async export(ctx: HttpContext) {
    ctx.response.header('Content-Type', 'text/csv; charset=utf-8')
    ctx.response.header('Content-Disposition', 'attachment; filename="products.csv"')
    ctx.response.header('Cache-Control', 'no-store')
    return ctx.response.send(await productsCsv())
  }

  async import(ctx: HttpContext) {
    const { file } = await ctx.request.validateUsing(importValidator)
    const result = await new ImportProducts().execute(
      await readFile(file.tmpPath!, 'utf8'),
      ctx.store.currency,
      ctx.auth.getUserOrFail().id,
      ctx.locale
    )
    ctx.session.flash('importResult', result)
    return ctx.response.redirect().toPath('/admin/products')
  }

  async create(ctx: HttpContext) {
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
    const { image } = await ctx.request.validateUsing(productImageValidator)
    const storageKey = await storePublicImage(image)
    return { storageKey, url: mediaUrl(storageKey) }
  }

  async update(ctx: HttpContext) {
    return this.save(ctx, Number(ctx.params.id))
  }

  private async save(ctx: HttpContext, id?: number) {
    const input = await ctx.request.validateUsing(productValidator)
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
