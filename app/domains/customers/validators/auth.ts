import vine from '@vinejs/vine'

export const loginValidator = vine.create({
  email: vine.string().trim().toLowerCase().email().maxLength(254),
  password: vine.string().minLength(1).maxLength(128),
})

export const registrationValidator = vine.create({
  fullName: vine.string().trim().minLength(1).maxLength(120),
  email: vine.string().trim().toLowerCase().email().maxLength(254),
  password: vine.string().minLength(12).maxLength(128).confirmed(),
})

export const profileValidator = vine.create({
  fullName: vine.string().trim().minLength(1).maxLength(120),
})
