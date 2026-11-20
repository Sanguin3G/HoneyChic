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
export interface OrderRefundRecord {
  id: number
  amountMinor: number
  reference: string
  note: string
  createdAt: string | null
}
export interface OrderReturnRecord {
  id: number
  orderItemId: number
  quantity: number
  reference: string
  note: string
  createdAt: string | null
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
  refundedMinor?: number
  refunds?: OrderRefundRecord[]
  returns?: OrderReturnRecord[]
  items: {
    id: number
    productName: string
    variantDescription: string
    sku: string
    unitPriceMinor: number
    quantity: number
    returnedQuantity?: number
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
