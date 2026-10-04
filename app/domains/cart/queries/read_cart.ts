import { mediaUrl } from '#core/support/stored_media'
import { cartQuantity, type CartState } from '#domains/cart/data/cart_state'
import { loadCartVariants, isPublicVariant } from './load_cart_variants.js'

/** Reprice every read. Carts neither reserve nor mutate inventory. */
export async function readCart(state: CartState) {
  const variants = state.lines.length
    ? await loadCartVariants(state.lines.map((line) => line[0]))
    : []
  const byId = new Map(variants.map((variant) => [variant.id, variant]))
  let total = 0n
  let amountLimited = false
  let hasUnavailable = false
  const items = state.lines.map(([variantId, quantity, seenPriceMinor]) => {
    const variant = byId.get(variantId)
    const visible = isPublicVariant(variant) && variant?.currency === state.currency
    const product = visible && variant ? variant.product : null
    const price = product && variant ? variant.priceMinor : null
    const amount = price === null ? null : BigInt(price) * BigInt(quantity)
    if (amount !== null) total += amount
    const limited = amount !== null && amount > BigInt(Number.MAX_SAFE_INTEGER)
    amountLimited ||= limited
    const issue =
      !product || !variant || variant.stock === 0
        ? 'unavailable'
        : variant.stock < quantity
          ? 'insufficient'
          : null
    hasUnavailable ||= !!issue
    const image = product?.images[0]
    return {
      variantId,
      quantity,
      product:
        product && variant
          ? {
              name: product.name,
              slug: product.slug,
              sku: variant.sku,
              description: variant.description,
              image: image ? { url: mediaUrl(image.storageKey), altText: image.altText } : null,
            }
          : null,
      unitPriceMinor: price,
      previousPriceMinor: price === null ? null : seenPriceMinor,
      priceChanged: price !== null && price !== seenPriceMinor,
      lineTotalMinor: amount === null || limited ? null : Number(amount),
      issue,
      amountLimited: limited,
    }
  })
  amountLimited ||= total > BigInt(Number.MAX_SAFE_INTEGER)
  return {
    items,
    currency: state.currency,
    quantity: cartQuantity(state),
    amountLimited,
    hasUnavailable,
    totalMinor: amountLimited || hasUnavailable ? null : Number(total),
  }
}
