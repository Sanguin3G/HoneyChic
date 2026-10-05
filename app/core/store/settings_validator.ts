import vine from '@vinejs/vine'
import { isManagedUpload } from '#core/support/stored_media'

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
const hexColor = vine.createRule((value, _, field) => {
  if (value === null || value === undefined) return
  if (typeof value !== 'string' || !/^#[0-9a-f]{6}$/.test(value)) {
    field.report('hexColor', 'hexColor', field)
  }
})
const primaryContrast = vine.createRule((value, _, field) => {
  if (typeof value !== 'string' || !/^#[0-9a-f]{6}$/.test(value)) return
  const channels = [1, 3, 5].map((offset) => {
    const channel = Number.parseInt(value.slice(offset, offset + 2), 16) / 255
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
  })
  const luminance = channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722
  if (1.05 / (luminance + 0.05) < 4.5) field.report('primaryContrast', 'primaryContrast', field)
})
const httpsUrl = vine.createRule((value, _, field) => {
  if (value === null || value === undefined) return
  if (typeof value !== 'string') return
  let url: URL
  try {
    url = new URL(value)
  } catch {
    field.report('httpsUrl', 'httpsUrl', field)
    return
  }
  if (url.protocol !== 'https:' || url.username || url.password || !url.hostname) {
    field.report('httpsUrl', 'httpsUrl', field)
  }
})
const managedUploadKey = vine.createRule((value, _, field) => {
  if (value === null || value === undefined) return
  if (typeof value !== 'string' || !isManagedUpload(value)) {
    field.report('managedUpload', 'managedUpload', field)
  }
})

const optionalHttps = () =>
  vine.string().trim().maxLength(300).use(httpsUrl()).nullable().optional()
const optionalUpload = () =>
  vine.string().trim().maxLength(80).use(managedUploadKey()).nullable().optional()

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
  logoKey: optionalUpload(),
  faviconKey: optionalUpload(),
  website: optionalHttps(),
  facebook: optionalHttps(),
  instagram: optionalHttps(),
  youtube: optionalHttps(),
  tiktok: optionalHttps(),
  primaryColor: vine
    .string()
    .trim()
    .toLowerCase()
    .use(hexColor())
    .use(primaryContrast())
    .nullable()
    .optional(),
  accentColor: vine.string().trim().toLowerCase().use(hexColor()).nullable().optional(),
})

export const brandImageValidator = vine.create({
  image: vine.file({
    size: '5mb',
    extnames: ['jpg', 'jpeg', 'png', 'webp', 'avif'],
  }),
})
