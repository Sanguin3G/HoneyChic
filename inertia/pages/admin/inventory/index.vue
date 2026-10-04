<script setup lang="ts">
import { Head, Link, router } from '@inertiajs/vue3'
import { ref } from 'vue'
import AdminLayout from '~/app/layouts/AdminLayout.vue'
import HcPanel from '~/app/design/HcPanel.vue'
import HcInput from '~/app/design/HcInput.vue'
import HcButton from '~/app/design/HcButton.vue'
import CatalogPagination from '~/features/catalog/CatalogPagination.vue'
import StockState from '~/features/inventory/StockState.vue'
import { useI18n } from '~/app/shared/i18n'
import type { InventoryVariant } from '~/features/inventory/types'
import type { Pagination } from '~/features/catalog/types'
const props = defineProps<{
  variants: InventoryVariant[]
  threshold: number
  filters: { q: string; state: string }
  pagination: Pagination
}>()
const q = ref(props.filters.q)
const state = ref(props.filters.state)
const { t } = useI18n()
function search() {
  router.get(
    '/admin/inventory',
    q.value ? { q: q.value, state: state.value } : { state: state.value }
  )
}
</script>
<template>
  <Head :title="t('inventory', 'title')"><meta name="robots" content="noindex" /></Head>
  <AdminLayout
    ><HcPanel
      ><h1>{{ t('inventory', 'title') }}</h1>
      <p>{{ t('inventory', 'threshold') }}: {{ threshold }}</p>
      <form class="catalog-search" @submit.prevent="search">
        <HcInput
          id="inventory-search"
          v-model="q"
          :label="t('inventory', 'search')"
          maxlength="200"
        />
        <div class="hc-field">
          <label for="inventory-state">{{ t('inventory', 'state') }}</label>
          <select id="inventory-state" v-model="state" class="hc-input">
            <option v-for="value in ['all', 'low', 'out', 'retired']" :key="value" :value="value">
              {{ t('inventory', value) }}
            </option>
          </select>
        </div>
        <HcButton type="submit">{{ t('inventory', 'search') }}</HcButton>
      </form>
      <div class="table-scroll">
        <table class="catalog-table">
          <thead>
            <tr>
              <th>{{ t('catalog', 'sku') }}</th>
              <th>{{ t('catalog', 'name') }}</th>
              <th>{{ t('inventory', 'stock') }}</th>
              <th>{{ t('inventory', 'state') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="variant in variants" :key="variant.id">
              <td>
                <Link :href="'/admin/inventory/' + variant.id">{{ variant.sku }}</Link>
                <p>{{ variant.description }}</p>
              </td>
              <td>
                <Link :href="'/admin/products/' + variant.product.id + '/edit'">{{
                  variant.product.name
                }}</Link>
              </td>
              <td>{{ variant.stock }}</td>
              <td><StockState :state="variant.state" /></td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-if="!variants.length">{{ t('inventory', 'noVariants') }}</p>
      <CatalogPagination
        :pagination="pagination"
        base="/admin/inventory"
        :filters="filters"
      /> </HcPanel
  ></AdminLayout>
</template>
