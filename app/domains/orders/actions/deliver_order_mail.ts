import logger from '@adonisjs/core/services/logger'
import mail from '@adonisjs/mail/services/main'
import env from '#start/env'
import StoreSetting from '#core/store/store_setting'
import { mailFrom } from '#core/support/mail_sender'
import { messagesFor } from '#core/support/translations'
import type { Locale } from '#core/support/locale'
import type Order from '#domains/orders/models/order'
import IssueGuestRecovery from '#domains/orders/actions/issue_guest_recovery'
import { formatMoney } from '#shared/money'

export type OrderMailKind = 'confirmation' | 'shipped' | 'cancelled'

const copyKeys = {
  confirmation: ['mailConfirmationSubject', 'mailConfirmationIntro'],
  shipped: ['mailShippedSubject', 'mailShippedIntro'],
  cancelled: ['mailCancelledSubject', 'mailCancelledIntro'],
} as const

export default class DeliverOrderMail {
  async execute(order: Order, kind: OrderMailKind) {
    try {
      const store = await StoreSetting.findOrFail(1)
      const from = mailFrom(store)
      if (!from) {
        logger.warn({ order: order.publicId, kind }, 'order mail skipped')
        return false
      }
      const locale: Locale = order.locale === 'vi' ? 'vi' : 'en'
      const copy = messagesFor(locale).orders
      const [subjectKey, introKey] = copyKeys[kind]
      const subject = fill(copy[subjectKey], store.name, order.number)
      const intro = fill(copy[introKey], store.name, order.number)
      const recovery = await new IssueGuestRecovery().execute(order)
      const origin = env.get('APP_URL')
      const actionUrl = recovery
        ? `${origin}/orders/recover/${recovery.id}/${recovery.secret}`
        : `${origin}/orders/${order.publicId}`
      const actionLabel = recovery ? copy.mailRecovery : copy.mailView
      const footnote = recovery ? copy.mailRecoveryHelp : ''
      const total = formatMoney(order.totalMinor, order.currency, locale)
      const text = [
        store.name,
        intro,
        `${copy.number}: ${order.number}`,
        `${copy.total}: ${total}`,
        `${actionLabel}: ${actionUrl}`,
        footnote,
      ]
        .filter(Boolean)
        .join('\n\n')
      await mail.send((message) => {
        message
          .from(from.address, from.name)
          .to(order.customerEmail, order.customerName)
          .subject(subject)
          .htmlView('emails/message', {
            locale,
            storeName: store.name,
            intro,
            rows: [
              { label: copy.number, value: order.number },
              { label: copy.total, value: total },
            ],
            actionUrl,
            actionLabel,
            footnote,
          })
          .text(text)
      })
      return true
    } catch (error) {
      logger.error(
        { order: order.publicId, kind, error: error instanceof Error ? error.name : 'Error' },
        'order mail failed'
      )
      return false
    }
  }
}

function fill(template: string, store: string, number: string) {
  return template.replaceAll('{store}', store).replaceAll('{number}', number)
}
