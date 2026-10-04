export interface ProductFormData {
  name: string
  slug: string
  description: string
  categoryId: number | null
  status: 'draft' | 'published' | 'archived'
  options: { name: string; values: string[] }[]
  variants: { id?: number; sku: string; price: string; selections: string[] }[]
  images: { storageKey: string; altText: string; isPrimary: boolean; url?: string }[]
}
export interface ProductSummary {
  id: number
  name: string
  slug: string
  status: ProductFormData['status']
  hasVariants: boolean
  available: boolean
  category: { name: string; slug: string } | null
  priceMinor: number | null
  currency: string | null
  image: { url: string; altText: string } | null
}
export interface ProductDetail extends ProductSummary {
  description: string
  options: ProductFormData['options']
  variants: {
    id: number
    sku: string
    priceMinor: number
    currency: string
    available: boolean
    description: string
    selections: string[]
  }[]
  images: { storageKey: string; altText: string; isPrimary: boolean; url: string }[]
}
export interface Pagination {
  page: number
  lastPage: number
  total: number
}
export interface Category {
  id: number
  name: string
  slug: string
  description: string
  isActive: boolean
}
