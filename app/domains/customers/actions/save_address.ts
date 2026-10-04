import db from '@adonisjs/lucid/services/db'
import User from '#domains/customers/models/user'
import CustomerAddress from '#domains/customers/models/customer_address'
import { rejectOrder } from '#domains/orders/errors/reject_order'
import type { Locale } from '#core/support/locale'
export default class SaveAddress {
  async execute(
    customerId: number,
    input: { label: string; recipient: string; phone: string; address: string },
    locale: Locale,
    id?: number
  ) {
    return db.transaction(async (trx) => {
      await User.query({ client: trx }).where('id', customerId).forUpdate().firstOrFail()
      if (id) {
        const row = await CustomerAddress.query({ client: trx })
          .where('id', id)
          .where('customerId', customerId)
          .firstOrFail()
        return row.merge(input).save()
      }
      const count = await CustomerAddress.query({ client: trx })
        .where('customerId', customerId)
        .count('* as total')
      if (Number(count[0].$extras.total) >= 20) rejectOrder('addressLimit', locale)
      return CustomerAddress.create({ ...input, customerId }, { client: trx })
    })
  }
}
