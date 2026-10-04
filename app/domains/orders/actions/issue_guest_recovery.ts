import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import type Order from '#domains/orders/models/order'
import OrderRecoveryToken from '#domains/orders/models/order_recovery_token'
import { secretLink } from '#core/support/secret_link'

export default class IssueGuestRecovery {
  async execute(order: Order) {
    if (order.customerId) return null
    const link = secretLink()
    await OrderRecoveryToken.create({
      id: link.id,
      orderId: order.id,
      tokenHash: await hash.make(link.secret),
      expiresAt: DateTime.utc().plus({ days: 7 }),
    })
    return link
  }
}
