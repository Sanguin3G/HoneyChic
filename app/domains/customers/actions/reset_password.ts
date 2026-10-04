import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import db from '@adonisjs/lucid/services/db'
import User from '#domains/customers/models/user'
import PasswordResetToken from '#domains/customers/models/password_reset_token'

export default class ResetPassword {
  async execute(id: string, secret: string, password: string) {
    return db.transaction(async (trx) => {
      const token = await PasswordResetToken.query({ client: trx })
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
      if (!user) return false
      user.useTransaction(trx)
      user.password = password
      await user.save()
      await PasswordResetToken.query({ client: trx })
        .where('userId', user.id)
        .whereNull('usedAt')
        .update({ usedAt: DateTime.utc() })
      return true
    })
  }
}
