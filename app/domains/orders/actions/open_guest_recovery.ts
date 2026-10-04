import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import Order from '#domains/orders/models/order'
import OrderRecoveryToken from '#domains/orders/models/order_recovery_token'

export default class OpenGuestRecovery {
  async execute(id: string, secret: string) {
    const token = await OrderRecoveryToken.find(id)
    if (!token || token.expiresAt.toMillis() <= DateTime.utc().toMillis()) return null
    let matches = false
    try {
      matches = await hash.verify(token.tokenHash, secret)
    } catch {
      return null
    }
    if (!matches) return null
    return Order.find(token.orderId)
  }
}
