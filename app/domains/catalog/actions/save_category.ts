import db from '@adonisjs/lucid/services/db'
import Category from '#domains/catalog/models/category'
import type { Infer } from '@vinejs/vine/types'
import type { categoryValidator } from '#domains/catalog/validators/catalog'
import type { Locale } from '#core/support/locale'
import { rejectCatalog } from '#domains/catalog/errors/reject_catalog'

export default class SaveCategory {
  async execute(id: number | null, input: Infer<typeof categoryValidator>, locale: Locale) {
    if (!input.name.trim()) rejectCatalog('name', 'invalidDefinition', locale)
    return db.transaction(async (trx) => {
      const category = id ? await Category.findOrFail(id, { client: trx }) : new Category()
      category.useTransaction(trx)
      return category.merge({ ...input, description: input.description ?? '' }).save()
    })
  }
}
