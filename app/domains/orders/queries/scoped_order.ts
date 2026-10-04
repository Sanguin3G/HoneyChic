import Order from '#domains/orders/models/order'
import { orderIdValidator } from '#domains/orders/validators/orders'
import type { Locale } from '#core/support/locale'
import { validationMessages } from '#core/support/validation_messages'
export async function scopedOrder(
  publicId: string,
  customerId: number | null,
  guestOrder: unknown,
  locale: Locale
) {
  const { id } = await orderIdValidator.validate(
    { id: publicId },
    { messagesProvider: validationMessages(locale) }
  )
  return Order.query()
    .where('publicId', id)
    .where((scope) => {
      if (customerId !== null) scope.where('customerId', customerId)
      else scope.whereRaw('false')
      if (guestOrder === id)
        scope.orWhere((guest) => guest.whereNull('customerId').where('publicId', id))
    })
    .preload('items', (items) => items.orderBy('id'))
    .firstOrFail()
}
