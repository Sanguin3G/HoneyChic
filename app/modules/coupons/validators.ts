import vine from '@vinejs/vine'
export const couponValidator = vine.create({
  id: vine.number().withoutDecimals().positive().max(2147483647).optional(),
  code: vine
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z0-9_-]{1,40}$/),
  kind: vine.enum(['fixed', 'percentage']),
  currency: vine.enum(Intl.supportedValuesOf('currency')),
  value: vine.number().withoutDecimals().min(1).max(Number.MAX_SAFE_INTEGER),
  minimumMinor: vine.number().withoutDecimals().min(0).max(Number.MAX_SAFE_INTEGER),
  startsAt: vine.string().maxLength(40).nullable().optional(),
  endsAt: vine.string().maxLength(40).nullable().optional(),
  usageLimit: vine.number().withoutDecimals().min(1).max(2147483647).nullable().optional(),
  isActive: vine.boolean(),
})
