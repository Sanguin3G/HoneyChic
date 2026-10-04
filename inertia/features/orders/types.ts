export interface OrderSummary {
  publicId: string
  number: string
  status: 'pending' | 'processing' | 'shipped' | 'completed' | 'cancelled'
  paymentStatus: 'unpaid' | 'paid' | 'refunded'
  currency: string
  totalMinor: number
  customerName: string
  createdAt: string
}
export interface OrderDetail extends OrderSummary {
  discountMinor: number
  shippingMinor: number
  shippingName: string
  couponCode: string
  customerEmail: string
  customerPhone: string
  deliveryAddress: string
  note: string
  items: {
    id: number
    productName: string
    variantDescription: string
    sku: string
    unitPriceMinor: number
    quantity: number
    discountMinor: number
    taxMinor: number
  }[]
}
export interface Address {
  id: number
  label: string
  recipient: string
  phone: string
  address: string
}
export interface Pagination {
  page: number
  lastPage: number
  total: number
}
