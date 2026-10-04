<script setup lang="ts">
import { Head, Link, router } from '@inertiajs/vue3'
import { ref } from 'vue'
import AdminLayout from '~/app/layouts/AdminLayout.vue'
import HcPanel from '~/app/design/HcPanel.vue'
import HcInput from '~/app/design/HcInput.vue'
import HcButton from '~/app/design/HcButton.vue'
import CatalogPagination from '~/features/catalog/CatalogPagination.vue'
import { useI18n } from '~/app/shared/i18n'
import { formatMoney } from '~/app/shared/money'
import type { ProductSummary, Pagination } from '~/features/catalog/types'
const props = defineProps<{
  products: ProductSummary[]
  filters: { q: string }
  pagination: Pagination
}>()
const { t, locale } = useI18n()
const q = ref(props.filters.q)
function search() {
  router.get('/admin/products', q.value ? { q: q.value } : {})
}
</script>
<template>
  <Head :title="t('catalog', 'products')"><meta name="robots" content="noindex" /></Head>
  <AdminLayout
    ><HcPanel
      ><div class="catalog-toolbar">
        <h1>{{ t('catalog', 'products') }}</h1>
        <Link href="/admin/products/create">{{ t('catalog', 'newProduct') }}</Link>
      </div>
      <form class="catalog-search" @submit.prevent="search">
        <HcInput id="search" v-model="q" :label="t('catalog', 'search')" /><HcButton
          type="submit"
          >{{ t('catalog', 'search') }}</HcButton
        >
      </form>
      <div class="table-scroll">
        <table class="catalog-table">
          <thead>
            <tr>
              <th>{{ t('catalog', 'name') }}</th>
              <th>{{ t('catalog', 'category') }}</th>
              <th>{{ t('catalog', 'status') }}</th>
              <th>{{ t('catalog', 'price') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="product in products" :key="product.id">
              <td>
                <Link :href="'/admin/products/' + product.id + '/edit'">{{ product.name }}</Link>
              </td>
              <td>{{ product.category?.name ?? t('catalog', 'uncategorized') }}</td>
              <td>{{ t('catalog', product.status) }}</td>
              <td>
                {{
                  product.priceMinor !== null && product.currency
                    ? formatMoney(product.priceMinor, product.currency, locale)
                    : '—'
                }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-if="!products.length">{{ t('catalog', 'noProducts') }}</p>
      <CatalogPagination
        :pagination="pagination"
        base="/admin/products"
        :filters="filters"
      /> </HcPanel
  ></AdminLayout>
</template>
