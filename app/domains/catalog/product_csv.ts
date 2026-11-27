import db from '@adonisjs/lucid/services/db'
import { errors } from '@vinejs/vine'
import Product from '#domains/catalog/models/product'
import Category from '#domains/catalog/models/category'
import ProductVariant from '#domains/catalog/models/product_variant'
import CreateProduct from '#domains/catalog/actions/create_product'
import AdjustInventory from '#domains/inventory/adjust_inventory'
import { productValidator, type ProductInput } from '#domains/catalog/validators'
import { csvDocument, parseCsv } from '#core/support/csv'
import { messagesFor } from '#core/support/translations'
import type { Locale } from '#core/support/locale'
import { decimalPrice } from '#shared/money'

/** One row per variant. Rows sharing a slug form one product; options read "Size: M / Color: Red". */
export const productCsvColumns = [
  'name',
  'slug',
  'status',
  'category',
  'description',
  'sku',
  'options',
  'price',
  'stock',
] as const
type Column = (typeof productCsvColumns)[number]
export const productImportLimit = 1000

export async function productsCsv() {
  const products = await Product.query()
    .preload('category')
    .preload('variants', (variants) => variants.where('isActive', true).orderBy('id'))
    .orderBy('id')
  const rows: (string | number)[][] = [[...productCsvColumns]]
  for (const product of products) {
    for (const variant of product.variants) {
      rows.push([
        product.name,
        product.slug,
        product.status,
        product.category?.name ?? '',
        product.description,
        variant.sku,
        variant.description,
        decimalPrice(variant.priceMinor, variant.currency),
        variant.stock,
      ])
    }
  }
  return csvDocument(rows)
}

export function slugify(value: string) {
  return (
    value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 200) || 'product'
  )
}

function parseOptions(text: string) {
  return text
    .split('/')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const [name, ...value] = part.split(':')
      return [name.trim(), value.join(':').trim()] as const
    })
}

function validationText(error: unknown, fallback: string) {
  if (!(error instanceof errors.E_VALIDATION_ERROR)) return fallback
  return (error.messages as { message: string }[]).map((item) => item.message).join('; ')
}

interface ParsedProduct {
  line: number
  input: ProductInput
  category: string
  stock: number[]
}

export interface ImportResult {
  created: number
  skipped: string[]
  errors: string[]
}

/**
 * Creates new products from CSV. Existing slugs are skipped, never overwritten, so
 * balances and order history stay untouched. Any invalid row imports nothing.
 * Stock is recorded as each new variant's initial_stock movement.
 */
export default class ImportProducts {
  async execute(
    csv: string,
    currency: string,
    actorId: number,
    locale: Locale
  ): Promise<ImportResult> {
    const copy = messagesFor(locale).catalog
    const rowError = (line: number, message: string) =>
      copy.importRow.replace('{row}', String(line)) + ' ' + message
    const rows = parseCsv(csv)
    const header = (rows.shift() ?? []).map((cell) => cell.trim().toLowerCase())
    const at = (row: string[], column: Column) => {
      const index = header.indexOf(column)
      return index === -1 ? '' : (row[index] ?? '').trim()
    }
    if (!['name', 'sku', 'price'].every((column) => header.includes(column)))
      return { created: 0, skipped: [], errors: [copy.importHeader] }
    if (rows.length > productImportLimit)
      return { created: 0, skipped: [], errors: [copy.importTooMany] }

    const groups = new Map<string, { line: number; row: string[] }[]>()
    rows.forEach((row, index) => {
      const slug = at(row, 'slug') || slugify(at(row, 'name'))
      groups.set(slug, [...(groups.get(slug) ?? []), { line: index + 2, row }])
    })
    const existingProducts = await Product.query()
      .whereIn('slug', [...groups.keys()])
      .select('slug')
    const existing = new Set(existingProducts.map((product) => product.slug))
    const takenVariants = await ProductVariant.query()
      .whereIn(
        'sku',
        rows.map((row) => at(row, 'sku').toUpperCase())
      )
      .select('sku')
    const takenSkus = new Set(takenVariants.map((variant) => variant.sku))

    const problems: string[] = []
    const parsed: ParsedProduct[] = []
    const skipped: string[] = []
    for (const [slug, lines] of groups) {
      if (existing.has(slug)) {
        skipped.push(slug)
        continue
      }
      const optionNames: string[] = []
      const optionValues: string[][] = []
      const variants: ProductInput['variants'] = []
      const stock: number[] = []
      let broken = false
      for (const { line, row } of lines) {
        const pairs = parseOptions(at(row, 'options'))
        const mismatched =
          (variants.length > 0 && pairs.length !== optionNames.length) ||
          pairs.some(
            ([name, value], index) =>
              !name || !value || (variants.length > 0 && optionNames[index] !== name)
          )
        if (mismatched) {
          problems.push(rowError(line, copy.importOptions))
          broken = true
          continue
        }
        pairs.forEach(([name, value], index) => {
          optionNames[index] = name
          optionValues[index] ??= []
          if (!optionValues[index].includes(value)) optionValues[index].push(value)
        })
        const sku = at(row, 'sku').toUpperCase()
        if (takenSkus.has(sku)) {
          problems.push(rowError(line, copy.importSkuTaken.replace('{sku}', sku)))
          broken = true
        }
        const quantity = at(row, 'stock') || '0'
        if (!/^\d{1,9}$/.test(quantity)) {
          problems.push(rowError(line, copy.importStock))
          broken = true
        }
        stock.push(Number(quantity))
        variants.push({ sku, price: at(row, 'price'), selections: pairs.map(([, value]) => value) })
      }
      if (broken) continue
      const first = lines[0]
      try {
        const input = await productValidator.validate({
          name: at(first.row, 'name'),
          slug,
          description: at(first.row, 'description') || null,
          categoryId: null,
          status: at(first.row, 'status').toLowerCase() || 'draft',
          options: optionNames.map((name, index) => ({ name, values: optionValues[index] })),
          variants,
          images: [],
        })
        parsed.push({ line: first.line, input, category: at(first.row, 'category'), stock })
      } catch (error) {
        problems.push(rowError(first.line, validationText(error, copy.invalidDefinition)))
      }
    }
    if (problems.length) return { created: 0, skipped, errors: problems.slice(0, 50) }

    let current = 0
    try {
      await db.transaction(async (trx) => {
        for (const product of parsed) {
          current = product.line
          let categoryId: number | null = null
          if (product.category) {
            const category =
              (await Category.query({ client: trx })
                .whereRaw('lower(name) = ?', [product.category.toLowerCase()])
                .first()) ??
              (await Category.create(
                {
                  name: product.category,
                  slug: slugify(product.category).slice(0, 140),
                  description: '',
                  isActive: true,
                },
                { client: trx }
              ))
            categoryId = category.id
          }
          const created = await new CreateProduct().execute(
            { ...product.input, categoryId },
            currency,
            locale,
            trx
          )
          const variants = await ProductVariant.query({ client: trx })
            .where('productId', created.id)
            .orderBy('id')
          for (const [position, variant] of variants.entries()) {
            const quantity = product.stock[position]
            if (quantity > 0)
              await new AdjustInventory().execute(
                {
                  variantId: variant.id,
                  quantityDelta: quantity,
                  reason: 'initial_stock',
                  reference: 'csv-import',
                  actorId,
                },
                locale,
                trx
              )
          }
        }
      })
    } catch (error) {
      const duplicate = (error as { code?: string }).code === '23505'
      const message = duplicate ? copy.alreadyUsed : validationText(error, copy.invalidDefinition)
      return { created: 0, skipped, errors: [rowError(current, message)] }
    }
    return { created: parsed.length, skipped, errors: [] }
  }
}
