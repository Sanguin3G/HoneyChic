import db from '@adonisjs/lucid/services/db'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'
import Product from '#domains/catalog/models/product'
import Category from '#domains/catalog/models/category'
import type { ProductInput } from '#domains/catalog/validators'
import type { Locale } from '#core/support/locale'
import { rejectCatalog } from '#domains/catalog/reject_catalog'
import { validateProductDefinition } from '#domains/catalog/actions/validate_product_definition'
import { syncProductDefinition } from '#domains/catalog/actions/sync_product_definition'

export default class CreateProduct {
  /** Pass a transaction to create several products all-or-nothing (CSV import). */
  async execute(
    input: ProductInput,
    currency: string,
    locale: Locale,
    transaction?: TransactionClientContract
  ) {
    const prices = validateProductDefinition(input, currency, locale)
    const create = async (trx: TransactionClientContract) => {
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
    }
    return transaction ? create(transaction) : db.transaction(create)
  }
}
