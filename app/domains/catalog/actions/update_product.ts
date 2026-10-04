import db from '@adonisjs/lucid/services/db'
import Product from '#domains/catalog/models/product'
import ProductVariant from '#domains/catalog/models/product_variant'
import Category from '#domains/catalog/models/category'
import type { ProductInput } from '#domains/catalog/validators/catalog'
import type { Locale } from '#core/support/locale'
import { rejectCatalog } from '#domains/catalog/errors/reject_catalog'
import { validateProductDefinition } from '#domains/catalog/actions/validate_product_definition'
import { syncProductDefinition } from '#domains/catalog/actions/sync_product_definition'

export default class UpdateProduct {
  async execute(id: number, input: ProductInput, locale: Locale) {
    return db.transaction(async (trx) => {
      const product = await Product.query({ client: trx }).where('id', id).forUpdate().firstOrFail()
      const existing = await ProductVariant.query({ client: trx })
        .where('productId', id)
        .orderBy('id')
        .forUpdate()
      const currency = existing[0].currency
      const prices = validateProductDefinition(input, currency, locale)
      if (input.categoryId && !(await Category.find(input.categoryId, { client: trx }))) {
        rejectCatalog('categoryId', 'categoryMissing', locale)
      }
      await product
        .merge({
          name: input.name,
          slug: input.slug,
          description: input.description ?? '',
          categoryId: input.categoryId,
          status: input.status,
        })
        .save()
      await syncProductDefinition(trx, id, input, existing, prices, currency, locale)
      return product
    })
  }
}
