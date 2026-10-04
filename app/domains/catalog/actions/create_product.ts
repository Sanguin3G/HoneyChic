import db from '@adonisjs/lucid/services/db'
import Product from '#domains/catalog/models/product'
import Category from '#domains/catalog/models/category'
import type { ProductInput } from '#domains/catalog/validators/catalog'
import type { Locale } from '#core/support/locale'
import { rejectCatalog } from '#domains/catalog/errors/reject_catalog'
import { validateProductDefinition } from '#domains/catalog/actions/validate_product_definition'
import { syncProductDefinition } from '#domains/catalog/actions/sync_product_definition'

export default class CreateProduct {
  async execute(input: ProductInput, currency: string, locale: Locale) {
    const prices = validateProductDefinition(input, currency, locale)
    return db.transaction(async (trx) => {
      if (input.categoryId && !(await Category.find(input.categoryId, { client: trx }))) {
        rejectCatalog('categoryId', 'categoryMissing', locale)
      }
      const product = await Product.create(
        {
          name: input.name,
          slug: input.slug,
          description: input.description ?? '',
          categoryId: input.categoryId,
          status: input.status,
        },
        { client: trx }
      )
      await syncProductDefinition(trx, product.id, input, [], prices, currency, locale)
      return product
    })
  }
}
