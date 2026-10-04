import vine from '@vinejs/vine'
export const addressValidator = vine.create({
  label: vine.string().trim().minLength(1).maxLength(80),
  recipient: vine.string().trim().minLength(1).maxLength(120),
  phone: vine.string().trim().minLength(1).maxLength(40),
  address: vine.string().trim().minLength(1).maxLength(1000),
})

export const addressIdValidator = vine.create({
  id: vine.number().withoutDecimals().min(1).max(2147483647),
})
