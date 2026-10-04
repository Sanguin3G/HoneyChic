import { SimpleMessagesProvider } from '@vinejs/vine'
import { messagesFor } from '#core/support/translations'
import type { Locale } from '#core/support/locale'

export function validationMessages(locale: Locale) {
  return new SimpleMessagesProvider(messagesFor(locale).validation)
}
