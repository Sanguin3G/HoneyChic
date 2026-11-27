import vine from '@vinejs/vine'
export const shippingRateValidator = vine.create({
  id: vine.number().withoutDecimals().positive().max(2147483647).optional(),
  name: vine.string().trim().minLength(1).maxLength(120),
  kind: vine.enum(['pickup', 'flat']),
  currency: vine.enum(Intl.supportedValuesOf('currency')),
  amountMinor: vine.number().withoutDecimals().min(0).max(Number.MAX_SAFE_INTEGER),
  freeAboveMinor: vine
    .number()
    .withoutDecimals()
    .min(0)
    .max(Number.MAX_SAFE_INTEGER)
    .nullable()
    .optional(),
  countries: vine
    .array(
      vine
        .string()
        .trim()
        .toUpperCase()
        .regex(/^[A-Z]{2}$/)
    )
    .maxLength(100),
  isActive: vine.boolean(),
})
