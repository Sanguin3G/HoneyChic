import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import Coupon from '#modules/coupons/models/coupon'
import { rejectModule } from '#modules/support/require_capability'
import type { Locale } from '#core/support/locale'
import type { Infer } from '@vinejs/vine/types'
import type { couponValidator } from '#modules/coupons/validators/coupon'
export default class SaveCoupon {
  async execute(input: Infer<typeof couponValidator>, locale: Locale) {
    return db.transaction(async (trx) => {
      const { id, startsAt, endsAt, ...values } = input
      const coupon = id
        ? await Coupon.query({ client: trx }).where('id', id).forUpdate().firstOrFail()
        : new Coupon()
      coupon.useTransaction(trx)
      const start = startsAt ? DateTime.fromISO(startsAt, { zone: 'utc' }) : null
      const end = endsAt ? DateTime.fromISO(endsAt, { zone: 'utc' }) : null
      if (
        (start && !start.isValid) ||
        (end && !end.isValid) ||
        (start && end && start >= end) ||
        (values.kind === 'percentage' && values.value > 10000) ||
        (values.usageLimit !== null &&
          values.usageLimit !== undefined &&
          values.usageLimit < (coupon.uses ?? 0))
      )
        rejectModule('invalidCouponSettings', locale)
      const duplicate = await Coupon.query({ client: trx })
        .where('code', values.code)
        .whereNot('id', id ?? 0)
        .first()
      if (duplicate) rejectModule('duplicateCoupon', locale)
      return coupon
        .merge({
          ...values,
          startsAt: start,
          endsAt: end,
          usageLimit: values.usageLimit ?? null,
          uses: coupon.uses ?? 0,
        })
        .save()
    })
  }
}
