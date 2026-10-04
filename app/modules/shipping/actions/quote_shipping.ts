import ShippingRate from '#modules/shipping/models/shipping_rate'
import { requireCapability, rejectModule } from '#modules/support/require_capability'
import type { Locale } from '#core/support/locale'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'
export default class QuoteShipping {
  async execute(
    id: number | undefined,
    country: string,
    subtotal: number,
    currency: string,
    locale: Locale,
    trx?: TransactionClientContract
  ) {
    await requireCapability('shipping', locale, trx)
    if (!id) rejectModule('shippingRequired', locale)
    const query = ShippingRate.query(trx ? { client: trx } : {})
      .where('id', id)
      .where('isActive', true)
    if (trx) query.forShare()
    const rate = await query.first()
    if (
      !rate ||
      rate.currency !== currency ||
      (rate.countries.length && !rate.countries.includes(country))
    )
      rejectModule('shippingUnavailable', locale)
    return {
      shippingName: rate.name,
      shippingMinor:
        rate.kind === 'pickup' || (rate.freeAboveMinor !== null && subtotal >= rate.freeAboveMinor)
          ? 0
          : rate.amountMinor,
    }
  }
}
