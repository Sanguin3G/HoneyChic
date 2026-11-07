import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import db from '@adonisjs/lucid/services/db'
import User from '#domains/customers/models/user'
import EmailVerificationToken from '#domains/customers/models/email_verification_token'

export default class ConfirmEmail {
  async execute(id: string, secret: string) {
    return db.transaction(async (trx) => {
      const token = await EmailVerificationToken.query({ client: trx })
        .where('id', id)
        .forUpdate()
        .first()
      if (!token || token.usedAt || token.expiresAt.toMillis() <= DateTime.utc().toMillis()) {
        return false
      }
      let matches = false
      try {
        matches = await hash.verify(token.tokenHash, secret)
      } catch {
        return false
      }
      if (!matches) return false
      const user = await User.query({ client: trx }).where('id', token.userId).forUpdate().first()
      if (!user || user.role !== 'customer') return false
      user.useTransaction(trx)
      user.emailVerifiedAt = DateTime.utc()
      await user.save()
      await EmailVerificationToken.query({ client: trx })
        .where('userId', user.id)
        .whereNull('usedAt')
        .update({ usedAt: DateTime.utc() })
      return true
    })
  }
}
