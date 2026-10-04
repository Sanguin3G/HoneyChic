<script setup lang="ts">
import { Link, usePage } from '@inertiajs/vue3'
import PageSeo from '~/app/shared/PageSeo.vue'
import StorefrontLayout from '~/app/layouts/StorefrontLayout.vue'
import HomeHero from '~/features/storefront/HomeHero.vue'
import CategoryLinks from '~/features/storefront/CategoryLinks.vue'
import ProductCard from '~/features/catalog/ProductCard.vue'
import { useI18n, type SharedProps } from '~/app/shared/i18n'
import type { ProductSummary } from '~/features/catalog/types'
defineProps<{ products: ProductSummary[]; categories: { name: string; slug: string }[] }>()
const page = usePage<SharedProps>()
const { t } = useI18n()
</script>
<template>
  <PageSeo
    :title="page.props.store.name"
    :description="page.props.store.description || t('storefront', 'intro')"
    path="/"
  />
  <StorefrontLayout
    ><HomeHero :product="products[0]" /><CategoryLinks :categories="categories" />
    <section class="shop-collection">
      <div class="section-heading">
        <h2>{{ t('storefront', 'collection') }}</h2>
        <Link href="/products">{{ t('storefront', 'viewAll') }} →</Link>
      </div>
      <div v-if="products.length" class="product-grid">
        <ProductCard v-for="product in products" :key="product.id" :product="product" />
      </div>
      <div v-else class="catalog-empty">
        <h2>{{ t('storefront', 'emptyTitle') }}</h2>
        <p>{{ t('storefront', 'emptyBody') }}</p>
      </div>
    </section></StorefrontLayout
  >
</template>
