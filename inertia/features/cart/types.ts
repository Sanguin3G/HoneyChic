export interface CartItem {
  variantId: number
  quantity: number
  product: {
    name: string
    slug: string
    sku: string
    description: string
    image: { url: string; altText: string } | null
  } | null
  unitPriceMinor: number | null
  previousPriceMinor: number | null
  priceChanged: boolean
  lineTotalMinor: number | null
  issue: 'unavailable' | 'insufficient' | null
  amountLimited: boolean
}
export interface CartView {
  items: CartItem[]
  currency: string | null
  quantity: number
  amountLimited: boolean
  hasUnavailable: boolean
  totalMinor: number | null
}
