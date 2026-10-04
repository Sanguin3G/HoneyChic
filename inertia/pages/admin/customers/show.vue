<script setup lang="ts">
import { Head, Link, useForm } from '@inertiajs/vue3'
import AdminLayout from '~/app/layouts/AdminLayout.vue'
import HcPanel from '~/app/design/HcPanel.vue'
import HcInput from '~/app/design/HcInput.vue'
import HcButton from '~/app/design/HcButton.vue'
import HcNotice from '~/app/design/HcNotice.vue'
import OrderList from '~/features/orders/OrderList.vue'
import type { OrderSummary, Pagination } from '~/features/orders/types'
import { useI18n } from '~/app/shared/i18n'
const props = defineProps<{
  customer: { id: number; fullName: string; email: string }
  orders: OrderSummary[]
  pagination: Pagination
}>()
const { t } = useI18n()
const form = useForm({ fullName: props.customer.fullName })
</script>
<template>
  <Head :title="customer.fullName"><meta name="robots" content="noindex,nofollow" /></Head>
  <AdminLayout
    ><Link href="/admin/customers">{{ t('admin', 'customers') }}</Link
    ><HcNotice />
    <HcPanel
      ><h1>{{ customer.fullName }}</h1>
      <p>{{ customer.email }}</p>
      <form class="hc-form" @submit.prevent="form.patch('/admin/customers/' + customer.id)">
        <HcInput
          id="customer-name"
          v-model="form.fullName"
          :label="t('admin', 'name')"
          :error="form.errors.fullName"
          maxlength="120"
          required
        /><HcButton type="submit" :disabled="form.processing">{{ t('admin', 'save') }}</HcButton>
      </form>
      <p class="hc-help">{{ t('admin', 'customerHelp') }}</p></HcPanel
    >
    <HcPanel
      ><h2>{{ t('orders', 'history') }}</h2>
      <OrderList
        :orders="orders"
        :pagination="pagination"
        :base="'/admin/customers/' + customer.id"
        admin
    /></HcPanel>
  </AdminLayout>
</template>
