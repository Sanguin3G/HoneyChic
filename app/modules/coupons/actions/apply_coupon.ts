import { DateTime } from 'luxon'
import Coupon from '#modules/coupons/models/coupon'
import { requireCapability, rejectModule } from '#modules/support/require_capability'
import type { Locale } from '#core/support/locale'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'
export default class ApplyCoupon {
  async execute(
    code: string,
    subtotal: number,
    currency: string,
    locale: Locale,
    trx?: TransactionClientContract
  ) {
    await requireCapability('coupons', locale, trx)
    const query = Coupon.query(trx ? { client: trx } : {}).where('code', code.trim().toUpperCase())
    if (trx) query.forUpdate()
    const coupon = await query.first()
    const now = DateTime.utc()
    if (
      !coupon ||
      !coupon.isActive ||
      coupon.currency !== currency ||
      subtotal < coupon.minimumMinor ||
      (coupon.startsAt && coupon.startsAt > now) ||
      (coupon.endsAt && coupon.endsAt <= now) ||
      (coupon.usageLimit !== null && coupon.uses >= coupon.usageLimit)
    )
      rejectModule('invalidCoupon', locale)
    const requested =
      coupon.kind === 'fixed'
        ? BigInt(coupon.value)
        : (BigInt(subtotal) * BigInt(coupon.value)) / 10000n
    return {
      coupon,
      discountMinor: Number(requested > BigInt(subtotal) ? BigInt(subtotal) : requested),
    }
  }
  async redeem(coupon: Coupon, orderId: number, trx: TransactionClientContract) {
    await trx.table('coupon_redemptions').insert({ coupon_id: coupon.id, order_id: orderId })
    coupon.useTransaction(trx)
    await coupon.merge({ uses: coupon.uses + 1 }).save()
  }
}
