export const cartSessionKey = 'cart'
export const maximumCartLines = 12
export const maximumCartQuantity = 99
export const maximumVariantId = 2_147_483_647
export type CartEntry = [variantId: number, quantity: number, seenPriceMinor: number]
export interface CartState {
  currency: string | null
  lines: CartEntry[]
}
export function emptyCart(): CartState {
  return { currency: null, lines: [] }
}
/** Compact bounded tuples keep the encrypted cookie session small. */
export function readCartState(value: unknown): CartState {
  if (!value || typeof value !== 'object') return emptyCart()
  const state = value as CartState
  if (
    !Array.isArray(state.lines) ||
    state.lines.length > maximumCartLines ||
    !state.currency ||
    !Intl.supportedValuesOf('currency').includes(state.currency)
  )
    return emptyCart()
  const ids = new Set<number>()
  for (const line of state.lines) {
    if (
      !Array.isArray(line) ||
      line.length !== 3 ||
      !Number.isInteger(line[0]) ||
      line[0] < 1 ||
      line[0] > maximumVariantId ||
      !Number.isInteger(line[1]) ||
      line[1] < 1 ||
      line[1] > maximumCartQuantity ||
      !Number.isSafeInteger(line[2]) ||
      line[2] < 0 ||
      ids.has(line[0])
    )
      return emptyCart()
    ids.add(line[0])
  }
  return state.lines.length
    ? { currency: state.currency, lines: state.lines.map((line) => [...line]) }
    : emptyCart()
}
export function removeCartItem(state: CartState, variantId: number): CartState {
  const lines = state.lines.filter((line) => line[0] !== variantId)
  return lines.length ? { ...state, lines } : emptyCart()
}
export function cartQuantity(state: CartState) {
  return state.lines.reduce((sum, line) => sum + line[1], 0)
}
