import { errors } from '@vinejs/vine'
import { messagesFor } from '#core/support/translations'
import type { Locale } from '#core/support/locale'
export function rejectCart(field: string, key: string, locale: Locale): never {
  throw new errors.E_VALIDATION_ERROR([
    { field, rule: key, message: messagesFor(locale).cart[key] },
  ])
}
