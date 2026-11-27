<script setup lang="ts">
import { Head, Link, router, useForm } from '@inertiajs/vue3'
import { PhDownloadSimple, PhPlus, PhUploadSimple } from '@phosphor-icons/vue'
import { ref } from 'vue'
import AdminLayout from '~/app/layouts/AdminLayout.vue'
import HcPanel from '~/app/design/HcPanel.vue'
import HcInput from '~/app/design/HcInput.vue'
import HcButton from '~/app/design/HcButton.vue'
import CatalogPagination from '~/features/catalog/CatalogPagination.vue'
import StatusMark from '~/app/design/StatusMark.vue'
import { statusTone } from '~/app/design/status_tone'
import { useI18n } from '~/app/shared/i18n'
import { formatMoney } from '~/app/shared/money'
import type { ProductSummary, Pagination } from '~/features/catalog/types'
const props = defineProps<{
  products: ProductSummary[]
  filters: { q: string }
  pagination: Pagination
  importResult: { created: number; skipped: string[]; errors: string[] } | null
}>()
const { t, locale } = useI18n()
const q = ref(props.filters.q)
const upload = useForm<{ file: File | null }>({ file: null })
function importCsv() {
  upload.post('/admin/products/import', { forceFormData: true, onSuccess: () => upload.reset() })
}
function search() {
  router.get('/admin/products', q.value ? { q: q.value } : {})
}
</script>
<template>
  <Head :title="t('catalog', 'products')"><meta name="robots" content="noindex" /></Head>
  <AdminLayout
    ><div class="admin-page-head">
      <h1>{{ t('catalog', 'products') }}</h1>
      <div class="hc-actions">
        <a class="hc-button" href="/admin/products/export"
          ><PhDownloadSimple :size="16" aria-hidden="true" />{{ t('catalog', 'exportCsv') }}</a
        >
        <Link class="hc-button hc-button--primary" href="/admin/products/create"
          ><PhPlus :size="16" aria-hidden="true" />{{ t('catalog', 'newProduct') }}</Link
        >
      </div>
    </div>
    <div v-if="importResult" class="import-report" role="status">
      <p v-if="importResult.created">
        {{ t('catalog', 'importCreated').replace('{count}', String(importResult.created)) }}
      </p>
      <p v-if="importResult.skipped.length">
        {{ t('catalog', 'importSkipped').replace('{slugs}', importResult.skipped.join(', ')) }}
      </p>
      <template v-if="importResult.errors.length">
        <p>{{ t('catalog', 'importFailed') }}</p>
        <ul>
          <li v-for="error in importResult.errors" :key="error">{{ error }}</li>
        </ul>
      </template>
    </div>
    <HcPanel>
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
              <td>
                <StatusMark :tone="statusTone(product.status)">{{
                  t('catalog', product.status)
                }}</StatusMark>
              </td>
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
      <CatalogPagination :pagination="pagination" base="/admin/products" :filters="filters" />
    </HcPanel>
    <HcPanel :title="t('catalog', 'importCsv')">
      <p class="hc-help">{{ t('catalog', 'importHelp') }}</p>
      <form class="catalog-import-form" @submit.prevent="importCsv">
        <div class="hc-field">
          <label for="import-file">{{ t('catalog', 'importFile') }}</label>
          <input
            id="import-file"
            class="hc-input"
            type="file"
            accept=".csv,text/csv"
            required
            @input="upload.file = ($event.target as HTMLInputElement).files?.[0] ?? null"
          />
          <p v-if="upload.errors.file" class="hc-error" role="alert">{{ upload.errors.file }}</p>
        </div>
        <HcButton type="submit" variant="quiet" :disabled="upload.processing || !upload.file"
          ><PhUploadSimple :size="16" aria-hidden="true" />{{
            t('catalog', 'importSubmit')
          }}</HcButton
        >
      </form>
    </HcPanel></AdminLayout
  >
</template>
