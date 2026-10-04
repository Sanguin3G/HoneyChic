import vine from '@vinejs/vine'

const currencyRule = vine.createRule((value, _, field) => {
  if (typeof value !== 'string' || !Intl.supportedValuesOf('currency').includes(value)) {
    field.report('currency', 'currency', field)
  }
})
const timezoneRule = vine.createRule((value, _, field) => {
  if (typeof value !== 'string') return
  try {
    new Intl.DateTimeFormat('en', { timeZone: value }).format()
  } catch {
    field.report('timezone', 'timezone', field)
  }
})

export const settingsValidator = vine.create({
  name: vine.string().trim().minLength(1).maxLength(120),
  description: vine.string().trim().maxLength(2000).nullable(),
  email: vine.string().trim().toLowerCase().email().maxLength(254).nullable(),
  phone: vine.string().trim().maxLength(40).nullable(),
  address: vine.string().trim().maxLength(1000).nullable(),
  currency: vine.string().trim().toUpperCase().fixedLength(3).use(currencyRule()),
  defaultLocale: vine.enum(['en', 'vi']),
  timezone: vine.string().trim().maxLength(80).use(timezoneRule()),
  orderPrefix: vine
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z0-9-]{1,12}$/),
  lowStockThreshold: vine.number().withoutDecimals().min(0).max(1000000),
  customerAccountsEnabled: vine.boolean(),
  registrationEnabled: vine.boolean(),
  guestCheckoutEnabled: vine.boolean().optional(),
})
