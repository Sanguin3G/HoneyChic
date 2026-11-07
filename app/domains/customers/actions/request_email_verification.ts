import { randomBytes } from 'node:crypto'
import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import logger from '@adonisjs/core/services/logger'
import db from '@adonisjs/lucid/services/db'
import mail from '@adonisjs/mail/services/main'
import env from '#start/env'
import StoreSetting from '#core/store/store_setting'
import { mailFrom } from '#core/support/mail_sender'
import { secretLink } from '#core/support/secret_link'
import { messagesFor } from '#core/support/translations'
import type { Locale } from '#core/support/locale'
import User from '#domains/customers/models/user'
import EmailVerificationToken from '#domains/customers/models/email_verification_token'

export default class RequestEmailVerification {
  async execute(email: string, locale: Locale) {
    const user = await User.findBy('email', email)
    const store = await StoreSetting.findOrFail(1)
    const from = mailFrom(store)
    if (
      !user ||
      !from ||
      user.role !== 'customer' ||
      !user.requiresEmailVerification ||
      user.emailVerifiedAt
    ) {
      await hash.make(randomBytes(32).toString('base64url'))
      return
    }
    const link = secretLink()
    const tokenHash = await hash.make(link.secret)
    await db.transaction(async (trx) => {
      await EmailVerificationToken.query({ client: trx })
        .where('userId', user.id)
        .whereNull('usedAt')
        .update({ usedAt: DateTime.utc() })
      await EmailVerificationToken.create(
        {
          id: link.id,
          userId: user.id,
          tokenHash,
          expiresAt: DateTime.utc().plus({ hours: 24 }),
        },
        { client: trx }
      )
    })
    void this.send(user.id, email, link, locale, store.name, from)
  }

  private async send(
    userId: number,
    email: string,
    link: { id: string; secret: string },
    locale: Locale,
    storeName: string,
    from: { address: string; name: string }
  ) {
    try {
      const url = `${env.get('APP_URL')}/email/verify/${link.id}/${link.secret}`
      const copy = messagesFor(locale).auth
      const intro = copy.mailVerifyIntro
      await mail.send((message) => {
        message
          .from(from.address, from.name)
          .to(email)
          .subject(copy.mailVerifySubject.replaceAll('{store}', storeName))
          .htmlView('emails/message', {
            locale,
            storeName,
            intro,
            rows: [],
            actionUrl: url,
            actionLabel: copy.mailVerifyAction,
            footnote: '',
          })
          .text([storeName, intro, `${copy.mailVerifyAction}: ${url}`].join('\n\n'))
      })
    } catch (error) {
      logger.error(
        { userId, error: error instanceof Error ? error.name : 'Error' },
        'email verification mail failed'
      )
    }
  }
}
