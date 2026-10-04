import vine from '@vinejs/vine'
export const customerListValidator = vine.create({
  page: vine.number().withoutDecimals().min(1).max(1000000).optional(),
  q: vine.string().trim().maxLength(120).optional(),
})
export const customerUpdateValidator = vine.create({
  fullName: vine.string().trim().minLength(1).maxLength(120),
})

export const customerIdValidator = vine.create({
  id: vine.number().withoutDecimals().min(1).max(2147483647),
})
