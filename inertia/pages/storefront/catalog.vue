<script setup lang="ts">
import { router } from '@inertiajs/vue3'
import { ref, watch } from 'vue'
import { PhSlidersHorizontal } from '@phosphor-icons/vue'
import PageSeo from '~/app/shared/PageSeo.vue'
import StorefrontLayout from '~/app/layouts/StorefrontLayout.vue'
import HcDialog from '~/app/design/HcDialog.vue'
import HcButton from '~/app/design/HcButton.vue'
import CatalogFilters from '~/features/catalog/CatalogFilters.vue'
import ProductCard from '~/features/catalog/ProductCard.vue'
import CatalogPagination from '~/features/catalog/CatalogPagination.vue'
import { useI18n } from '~/app/shared/i18n'
import type { ProductSummary, Pagination } from '~/features/catalog/types'
const props = defineProps<{
  products: ProductSummary[]
  categories: { name: string; slug: string }[]
  filters: { q: string; category: string; inStock: string }
  pagination: Pagination
}>()
const { t } = useI18n()
const filters = ref({ ...props.filters })
const open = ref(false)
watch(
  () => props.filters,
  (value) => {
    filters.value = { ...value }
  }
)
function apply() {
  open.value = false
  const query: Record<string, string> = {}
  for (const [key, value] of Object.entries(filters.value)) if (value) query[key] = value
  router.get('/products', query)
}
function reset() {
  filters.value = { q: '', category: '', inStock: '' }
  apply()
}
</script>
<template>
  <PageSeo
    :title="t('catalog', 'products')"
    :description="t('storefront', 'intro')"
    path="/products"
    :filtered="Object.values(props.filters).some(Boolean) || props.pagination.page > 1"
  />
  <StorefrontLayout
    ><div class="catalog-heading">
      <div>
        <p class="eyebrow">{{ t('storefront', 'explore') }}</p>
        <h1>{{ t('catalog', 'products') }}</h1>
      </div>
      <HcButton
        class="mobile-filter-toggle"
        variant="quiet"
        aria-controls="catalog-filter-drawer"
        :aria-expanded="open"
        @click="open = true"
        ><PhSlidersHorizontal :size="20" aria-hidden="true" />{{
          t('storefront', 'filters')
        }}</HcButton
      >
    </div>
    <div class="catalog-layout">
      <aside class="desktop-catalog-filters" :aria-label="t('storefront', 'filters')">
        <h2>{{ t('storefront', 'filters') }}</h2>
        <CatalogFilters
          v-model:filters="filters"
          prefix="desktop"
          :categories="categories"
          @apply="apply"
          @reset="reset"
        />
      </aside>
      <section class="catalog-results">
        <div class="catalog-results-toolbar" role="status">
          <strong>{{ pagination.total }}</strong> {{ t('storefront', 'results')
          }}<span v-if="props.filters.q"> · {{ props.filters.q }}</span>
        </div>
        <div v-if="products.length" class="product-grid">
          <ProductCard v-for="product in products" :key="product.id" :product="product" />
        </div>
        <div v-else class="catalog-empty">
          <h2>{{ t('catalog', 'noProducts') }}</h2>
          <p>{{ t('storefront', 'noResults') }}</p>
          <HcButton variant="quiet" @click="reset">{{ t('storefront', 'reset') }}</HcButton>
        </div>
        <CatalogPagination :pagination="pagination" base="/products" :filters="props.filters" />
      </section>
    </div>
    <HcDialog id="catalog-filter-drawer" v-model:open="open" :title="t('storefront', 'filters')"
      ><CatalogFilters
        v-model:filters="filters"
        prefix="drawer"
        :categories="categories"
        @apply="apply"
        @reset="reset"
    /></HcDialog>
  </StorefrontLayout>
</template>
