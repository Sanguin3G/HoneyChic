<script setup lang="ts">
import { Head, Link } from '@inertiajs/vue3'
import AdminLayout from '~/app/layouts/AdminLayout.vue'
import HcPanel from '~/app/design/HcPanel.vue'
import OrderList from '~/features/orders/OrderList.vue'
import type { OrderSummary } from '~/features/orders/types'
import { useI18n } from '~/app/shared/i18n'
import { formatMoney } from '~/app/shared/money'
defineProps<{
  dashboard: {
    counts: Record<string, number>
    totals: { currency: string; count: number; amountMinor: string }[]
    recent: OrderSummary[]
  }
}>()
const { t, locale } = useI18n()
const metrics = [
  { key: 'orders', label: 'orders', href: '/admin/orders' },
  { key: 'open_orders', label: 'openOrders', href: '/admin/orders?status=pending' },
  { key: 'products', label: 'products', href: '/admin/products' },
  { key: 'customers', label: 'customers', href: '/admin/customers' },
  { key: 'low_stock', label: 'lowStock', href: '/admin/inventory?state=low' },
]
</script>
<template>
  <Head :title="t('admin', 'dashboard')"><meta name="robots" content="noindex,nofollow" /></Head>
  <AdminLayout
    ><h1>{{ t('admin', 'dashboard') }}</h1>
    <div class="admin-metrics">
      <HcPanel v-for="metric in metrics" :key="metric.key"
        ><Link :href="metric.href">{{ t('admin', metric.label) }}</Link
        ><strong>{{ dashboard.counts[metric.key] }}</strong></HcPanel
      >
    </div>
    <HcPanel
      ><h2>{{ t('admin', 'orderValue') }}</h2>
      <p class="hc-help">{{ t('admin', 'valueHelp') }}</p>
      <ul class="order-lines">
        <li v-for="total in dashboard.totals" :key="total.currency">
          <strong>{{ formatMoney(BigInt(total.amountMinor), total.currency, locale) }}</strong> ·
          {{ total.count }} {{ t('admin', 'count') }}
        </li>
      </ul>
    </HcPanel>
    <HcPanel
      ><h2>{{ t('admin', 'recent') }}</h2>
      <OrderList
        :orders="dashboard.recent"
        :pagination="{ page: 1, lastPage: 1, total: dashboard.recent.length }"
        base="/admin/orders"
        admin
      /><Link href="/admin/orders">{{ t('admin', 'orders') }}</Link></HcPanel
    >
  </AdminLayout>
</template>
