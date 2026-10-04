<script setup lang="ts">
import { Head, Link } from '@inertiajs/vue3'
import AdminLayout from '~/app/layouts/AdminLayout.vue'
import HcPanel from '~/app/design/HcPanel.vue'
import StockState from '~/features/inventory/StockState.vue'
import AdjustmentForm from '~/features/inventory/AdjustmentForm.vue'
import MovementTable from '~/features/inventory/MovementTable.vue'
import CatalogPagination from '~/features/catalog/CatalogPagination.vue'
import { useI18n } from '~/app/shared/i18n'
import type { InventoryVariant, Movement } from '~/features/inventory/types'
import type { Pagination } from '~/features/catalog/types'
defineProps<{ variant: InventoryVariant; movements: Movement[]; pagination: Pagination }>()
const { t } = useI18n()
</script>
<template>
  <Head :title="t('inventory', 'title') + ' · ' + variant.sku"
    ><meta name="robots" content="noindex"
  /></Head>
  <AdminLayout
    ><HcPanel
      ><Link href="/admin/inventory">{{ t('inventory', 'back') }}</Link>
      <h1>{{ variant.sku }}</h1>
      <Link :href="'/admin/products/' + variant.product.id + '/edit'">{{
        variant.product.name
      }}</Link>
      <p>{{ variant.description }}</p>
      <p>
        {{ t('inventory', 'stock') }}: <strong>{{ variant.stock }}</strong> ·
        <StockState :state="variant.state" />
      </p>
      <AdjustmentForm
        v-if="variant.isActive || variant.stock > 0"
        :key="variant.id"
        :variant-id="variant.id"
        :retired="!variant.isActive"
      />
      <MovementTable :movements="movements" /><CatalogPagination
        :pagination="pagination"
        :base="'/admin/inventory/' + variant.id"
      /> </HcPanel
  ></AdminLayout>
</template>
