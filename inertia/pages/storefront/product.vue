<script setup lang="ts">
import { Link, usePage } from '@inertiajs/vue3'
import PageSeo from '~/app/shared/PageSeo.vue'
import StorefrontLayout from '~/app/layouts/StorefrontLayout.vue'
import ProductReviews from '~/modules/reviews/ProductReviews.vue'
import WishlistButton from '~/modules/wishlist/WishlistButton.vue'
import type { SharedProps } from '~/app/shared/i18n'
import ProductPreview from '~/features/catalog/ProductPreview.vue'
import { useI18n } from '~/app/shared/i18n'
import type { ProductDetail } from '~/features/catalog/types'
defineProps<{
  structuredData: Record<string, unknown>
  product: ProductDetail
  saved: boolean
  reviews: {
    rows: { id: number; rating: number; body: string }[]
    mine: { rating: number; body: string } | null
  } | null
}>()
const page = usePage<SharedProps>()
const { t } = useI18n()
</script>
<template>
  <PageSeo
    :title="product.name"
    :description="product.description"
    :path="'/products/' + product.slug"
    :image="product.images[0]?.url"
    product
    :structured-data="structuredData"
  />
  <StorefrontLayout
    ><nav class="shop-breadcrumbs" :aria-label="t('catalog', 'products')">
      <Link href="/">{{ t('storefront', 'home') }}</Link
      ><span aria-hidden="true">/</span><Link href="/products">{{ t('catalog', 'products') }}</Link
      ><template v-if="product.category"
        ><span aria-hidden="true">/</span
        ><Link :href="'/products?category=' + product.category.slug">{{
          product.category.name
        }}</Link></template
      >
    </nav>
    <ProductPreview :key="product.id" :product="product" />
    <WishlistButton
      v-if="page.props.auth && page.props.capabilities.wishlist.available"
      :slug="product.slug"
      :saved="saved"
    />
    <ProductReviews v-if="reviews" :key="product.id" :slug="product.slug" :reviews="reviews" />
  </StorefrontLayout>
</template>
