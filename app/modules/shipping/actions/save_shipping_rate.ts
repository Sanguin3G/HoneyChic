import ShippingRate from '#modules/shipping/models/shipping_rate'
import type { Infer } from '@vinejs/vine/types'
import type { shippingRateValidator } from '#modules/shipping/validators/shipping_rate'
export default class SaveShippingRate {
  async execute(input: Infer<typeof shippingRateValidator>) {
    const { id, ...values } = input
    const rate = id ? await ShippingRate.findOrFail(id) : new ShippingRate()
    return rate
      .merge({
        ...values,
        countries: [...new Set(values.countries)],
        freeAboveMinor: values.freeAboveMinor ?? null,
        amountMinor: values.kind === 'pickup' ? 0 : values.amountMinor,
      })
      .save()
  }
}
