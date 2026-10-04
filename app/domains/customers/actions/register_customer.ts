import User from '#domains/customers/models/user'
import type { Locale } from '#core/support/locale'

export default class RegisterCustomer {
  async execute(input: { fullName: string; email: string; password: string }, locale: Locale) {
    // Never accept a client-selected role or mass-assign the request payload.
    return User.create({
      fullName: input.fullName,
      email: input.email,
      password: input.password,
      role: 'customer',
      preferredLocale: locale,
    })
  }
}
