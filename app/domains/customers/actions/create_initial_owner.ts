import db from '@adonisjs/lucid/services/db'
import User from '#domains/customers/models/user'

export default class CreateInitialOwner {
  async execute(input: { fullName: string; email: string; password: string }) {
    return db.transaction(async (trx) => {
      // The lock also covers an initially empty users table.
      await trx.rawQuery('SELECT pg_advisory_xact_lock(726001)')
      if (await User.query({ client: trx }).where('role', 'owner').first()) return null
      return User.create(
        { fullName: input.fullName, email: input.email, password: input.password, role: 'owner' },
        { client: trx }
      )
    })
  }
}
