<script setup lang="ts">
import { Head, useForm } from '@inertiajs/vue3'
import AdminLayout from '~/app/layouts/AdminLayout.vue'
import HcPanel from '~/app/design/HcPanel.vue'
import HcButton from '~/app/design/HcButton.vue'
import HcInput from '~/app/design/HcInput.vue'
import OrderList from '~/features/orders/OrderList.vue'
import type { OrderSummary, Pagination } from '~/features/orders/types'
import { useI18n } from '~/app/shared/i18n'
const props = defineProps<{
  orders: OrderSummary[]
  pagination: Pagination
  filters: { q: string; status: string }
}>()
const { t } = useI18n()
const form = useForm({ ...props.filters })
const statuses = ['pending', 'processing', 'shipped', 'completed', 'cancelled']
const base =
  '/admin/orders?' +
  new URLSearchParams(Object.entries(props.filters).filter(([, v]) => v)).toString()
function search() {
  form
    .transform((data) => Object.fromEntries(Object.entries(data).filter(([, v]) => v)))
    .get('/admin/orders')
}
</script>
<template>
  <Head :title="t('admin', 'orders')"><meta name="robots" content="noindex,nofollow" /></Head>
  <AdminLayout
    ><HcPanel
      ><h1>{{ t('admin', 'orders') }}</h1>
      <form class="admin-filters" @submit.prevent="search">
        <HcInput id="order-search" v-model="form.q" :label="t('admin', 'search')" maxlength="120" />
        <label class="hc-field" for="order-status"
          >{{ t('orders', 'status')
          }}<select id="order-status" v-model="form.status" class="hc-input">
            <option value="">{{ t('admin', 'allStatuses') }}</option>
            <option v-for="status in statuses" :key="status" :value="status">
              {{ t('orders', status) }}
            </option>
          </select></label
        >
        <HcButton type="submit" :disabled="form.processing">{{ t('admin', 'filter') }}</HcButton>
      </form>
      <OrderList :orders="orders" :pagination="pagination" :base="base" admin /> </HcPanel
  ></AdminLayout>
</template>
