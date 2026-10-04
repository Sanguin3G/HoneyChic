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
import PasswordResetToken from '#domains/customers/models/password_reset_token'

export default class RequestPasswordReset {
  async execute(email: string, locale: Locale) {
    const user = await User.findBy('email', email)
    if (!user) {
      await hash.make(randomBytes(32).toString('base64url'))
      return
    }
    const link = secretLink()
    const tokenHash = await hash.make(link.secret)
    await db.transaction(async (trx) => {
      await PasswordResetToken.query({ client: trx })
        .where('userId', user.id)
        .whereNull('usedAt')
        .update({ usedAt: DateTime.utc() })
      await PasswordResetToken.create(
        {
          id: link.id,
          userId: user.id,
          tokenHash,
          expiresAt: DateTime.utc().plus({ hours: 1 }),
        },
        { client: trx }
      )
    })
    await this.send(user.id, email, link, locale)
  }

  private async send(
    userId: number,
    email: string,
    link: { id: string; secret: string },
    locale: Locale
  ) {
    try {
      const store = await StoreSetting.findOrFail(1)
      const from = mailFrom(store)
      if (!from) {
        logger.warn({ userId }, 'password reset mail skipped')
        return
      }
      const url = `${env.get('APP_URL')}/password/reset/${link.id}/${link.secret}`
      const copy = messagesFor(locale).auth
      const intro = copy.mailResetIntro
      await mail.send((message) => {
        message
          .from(from.address, from.name)
          .to(email)
          .subject(copy.mailResetSubject.replaceAll('{store}', store.name))
          .htmlView('emails/message', {
            locale,
            storeName: store.name,
            intro,
            rows: [],
            actionUrl: url,
            actionLabel: copy.mailResetAction,
            footnote: '',
          })
          .text([store.name, intro, `${copy.mailResetAction}: ${url}`].join('\n\n'))
      })
    } catch (error) {
      logger.error(
        { userId, error: error instanceof Error ? error.name : 'Error' },
        'password reset mail failed'
      )
    }
  }
}
