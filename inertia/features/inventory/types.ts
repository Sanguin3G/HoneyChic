export interface InventoryVariant {
  id: number
  sku: string
  description: string
  stock: number
  isActive: boolean
  product: { id: number; name: string }
  state: 'available' | 'out' | 'low' | 'retired'
}
export interface Movement {
  id: number
  quantityDelta: number
  stockAfter: number
  reason: string
  reference: string | null
  note: string
  actor: string | null
  createdAt: string
}
