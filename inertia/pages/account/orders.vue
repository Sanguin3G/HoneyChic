<script setup lang="ts">
import { Head } from '@inertiajs/vue3'
import AccountLayout from '~/app/layouts/AccountLayout.vue'
import HcPanel from '~/app/design/HcPanel.vue'
import OrderList from '~/features/orders/OrderList.vue'
import type { OrderSummary, Pagination } from '~/features/orders/types'
import { useI18n } from '~/app/shared/i18n'
defineProps<{ orders: OrderSummary[]; pagination: Pagination }>()
const { t } = useI18n()
</script>
<template>
  <Head :title="t('orders', 'history')"><meta name="robots" content="noindex,nofollow" /></Head>
  <AccountLayout
    ><HcPanel
      ><h1>{{ t('orders', 'history') }}</h1>
      <OrderList :orders="orders" :pagination="pagination" base="/account/orders" /></HcPanel
  ></AccountLayout>
</template>
