import vine from '@vinejs/vine'
import type { Infer } from '@vinejs/vine/types'

const slug = () =>
  vine
    .string()
    .trim()
    .maxLength(200)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
export const categoryValidator = vine.create({
  name: vine.string().minLength(1).maxLength(120),
  slug: slug().maxLength(140),
  description: vine.string().maxLength(2000).nullable(),
  isActive: vine.boolean(),
})

export const productValidator = vine.create({
  name: vine.string().minLength(1).maxLength(180),
  slug: slug(),
  description: vine.string().maxLength(10000).nullable(),
  categoryId: vine.number().withoutDecimals().positive().nullable(),
  status: vine.enum(['draft', 'published', 'archived']),
  options: vine
    .array(
      vine.object({
        name: vine.string().minLength(1).maxLength(80),
        values: vine.array(vine.string().minLength(1).maxLength(80)).minLength(1).maxLength(30),
      })
    )
    .maxLength(3),
  variants: vine
    .array(
      vine.object({
        id: vine.number().withoutDecimals().positive().optional(),
        sku: vine
          .string()
          .trim()
          .toUpperCase()
          .regex(/^[A-Z0-9][A-Z0-9._-]{0,79}$/),
        price: vine.string().trim().minLength(1).maxLength(25),
        selections: vine.array(vine.string().maxLength(80)).maxLength(3),
      })
    )
    .minLength(1)
    .maxLength(100),
  images: vine
    .array(
      vine.object({
        storageKey: vine
          .string()
          .maxLength(255)
          .regex(/^(?:[A-Za-z0-9_-]+\/)*[A-Za-z0-9_-]+\.(?:jpg|jpeg|png|webp|avif|svg)$/),
        altText: vine.string().minLength(1).maxLength(200),
        isPrimary: vine.boolean(),
      })
    )
    .maxLength(12),
})
export type ProductInput = Infer<typeof productValidator>

export const catalogQueryValidator = vine.create({
  inStock: vine.enum(['1']).optional(),
  q: vine.string().trim().maxLength(200).optional(),
  category: vine.string().trim().maxLength(140).optional(),
  page: vine.number().withoutDecimals().min(1).max(100000).optional(),
})
