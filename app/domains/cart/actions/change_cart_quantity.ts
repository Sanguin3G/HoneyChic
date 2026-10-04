import type { Locale } from '#core/support/locale'
import {
  maximumCartLines,
  maximumCartQuantity,
  maximumVariantId,
  type CartState,
} from '#domains/cart/data/cart_state'
import { rejectCart } from '#domains/cart/errors/reject_cart'
import { loadCartVariants, isPublicVariant } from '#domains/cart/queries/load_cart_variants'
import { readCart } from '#domains/cart/queries/read_cart'

export default class ChangeCartQuantity {
  async execute(
    state: CartState,
    input: {
      variantId: number
      quantity: number
      mode: 'add' | 'replace'
    },
    locale: Locale
  ): Promise<CartState> {
    if (
      !Number.isInteger(input.variantId) ||
      input.variantId < 1 ||
      input.variantId > maximumVariantId
    )
      rejectCart('variantId', 'unavailable', locale)
    if (
      !Number.isInteger(input.quantity) ||
      input.quantity < 1 ||
      input.quantity > maximumCartQuantity
    )
      rejectCart('quantity', 'invalidQuantity', locale)
    const existing = state.lines.find((line) => line[0] === input.variantId)
    if (input.mode === 'replace' && !existing) rejectCart('quantity', 'missing', locale)
    if (!existing && state.lines.length >= maximumCartLines)
      rejectCart('quantity', 'lineLimit', locale)
    const [variant] = await loadCartVariants([input.variantId])
    if (!isPublicVariant(variant)) rejectCart('quantity', 'unavailable', locale)
    if (state.currency && state.currency !== variant.currency)
      rejectCart('quantity', 'currencyMismatch', locale)
    const quantity = input.quantity + (input.mode === 'add' ? (existing?.[1] ?? 0) : 0)
    if (quantity > maximumCartQuantity) rejectCart('quantity', 'invalidQuantity', locale)
    if (quantity > variant.stock) rejectCart('quantity', 'insufficient', locale)
    const next: CartState = {
      currency: variant.currency,
      lines: state.lines.map((line) => [...line]),
    }
    const index = next.lines.findIndex((line) => line[0] === variant.id)
    const entry: [number, number, number] = [
      variant.id,
      quantity,
      existing?.[2] ?? variant.priceMinor,
    ]
    if (index === -1) next.lines.push(entry)
    else next.lines[index] = entry
    const view = await readCart(next)
    if (view.amountLimited) rejectCart('quantity', 'amountLimit', locale)
    return next
  }
}
