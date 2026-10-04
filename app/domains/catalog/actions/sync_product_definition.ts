import type { TransactionClientContract } from '@adonisjs/lucid/types/database'
import type { ProductInput } from '#domains/catalog/validators/catalog'
import ProductVariant from '#domains/catalog/models/product_variant'
import type { Locale } from '#core/support/locale'
import { rejectCatalog } from '#domains/catalog/errors/reject_catalog'

/** Reconcile one product definition inside its caller's locked transaction. */
export async function syncProductDefinition(
  trx: TransactionClientContract,
  productId: number,
  input: ProductInput,
  existing: ProductVariant[],
  prices: number[],
  currency: string,
  locale: Locale
) {
  const ownedIds = new Set(existing.map((variant) => variant.id))
  if (input.variants.some((variant) => variant.id && !ownedIds.has(variant.id))) {
    rejectCatalog('variants', 'invalidVariantId', locale)
  }
  const retainedIds = new Set(input.variants.map((variant) => variant.id))
  if (existing.some((variant) => !retainedIds.has(variant.id) && variant.stock > 0)) {
    rejectCatalog('variants', 'retireStock', locale)
  }
  // Retire omitted variants without deleting their identity or reserved SKU.
  for (const variant of existing) {
    variant.useTransaction(trx)
    await variant.merge({ isActive: false }).save()
  }
  await trx.from('product_options').where('product_id', productId).delete()
  const optionValueIds: Map<string, number>[] = []
  for (const [position, option] of input.options.entries()) {
    const [saved] = await trx
      .table('product_options')
      .insert({
        product_id: productId,
        name: option.name,
        sort_order: position,
      })
      .returning('id')
    const values = new Map<string, number>()
    for (const [sortOrder, value] of option.values.entries()) {
      const [row] = await trx
        .table('product_option_values')
        .insert({
          product_option_id: saved.id,
          value,
          sort_order: sortOrder,
        })
        .returning('id')
      values.set(value, row.id)
    }
    optionValueIds.push(values)
  }
  for (const [position, variant] of input.variants.entries()) {
    const data = {
      productId,
      sku: variant.sku,
      priceMinor: prices[position],
      currency,
      description: input.options
        .map((option, index) => option.name + ': ' + variant.selections[index])
        .join(' / '),
      combinationKey: JSON.stringify(variant.selections),
      isActive: true,
    }
    const saved = variant.id ? existing.find((row) => row.id === variant.id)! : new ProductVariant()
    saved.useTransaction(trx)
    await saved.merge(data).save()
    const values = variant.selections.map((value, index) => ({
      product_variant_id: saved.id,
      product_option_value_id: optionValueIds[index].get(value)!,
    }))
    if (values.length) await trx.table('product_variant_option_values').insert(values)
  }
  await trx.from('product_images').where('product_id', productId).delete()
  if (input.images.length)
    await trx.table('product_images').insert(
      input.images.map((image, sortOrder) => ({
        product_id: productId,
        storage_key: image.storageKey,
        alt_text: image.altText,
        sort_order: sortOrder,
        is_primary: image.isPrimary,
      }))
    )
}
