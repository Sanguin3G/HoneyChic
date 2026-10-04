<script setup lang="ts">
import { Link } from '@inertiajs/vue3'
import type { OrderSummary, Pagination } from './types'
import { useI18n } from '~/app/shared/i18n'
import { formatMoney } from '~/app/shared/money'
defineProps<{ orders: OrderSummary[]; pagination: Pagination; base: string; admin?: boolean }>()
const { t, locale } = useI18n()
</script>
<template>
  <div class="hc-table-scroll">
    <table class="order-table">
      <thead>
        <tr>
          <th>{{ t('orders', 'number') }}</th>
          <th>{{ t('orders', 'customer') }}</th>
          <th>{{ t('orders', 'status') }}</th>
          <th>{{ t('orders', 'payment') }}</th>
          <th>{{ t('orders', 'total') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="order in orders" :key="order.publicId">
          <td>
            <Link :href="(admin ? '/admin/orders/' : '/orders/') + order.publicId">{{
              order.number
            }}</Link>
          </td>
          <td>{{ order.customerName }}</td>
          <td>{{ t('orders', order.status) }}</td>
          <td>{{ t('orders', order.paymentStatus) }}</td>
          <td>{{ formatMoney(order.totalMinor, order.currency, locale) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
  <p v-if="!orders.length">{{ t('orders', 'empty') }}</p>
  <nav v-if="pagination.lastPage > 1" class="cart-toolbar" :aria-label="t('catalog', 'pagination')">
    <Link
      v-if="pagination.page > 1"
      :href="base + (base.includes('?') ? '&' : '?') + 'page=' + (pagination.page - 1)"
      >{{ t('catalog', 'previous') }}</Link
    >
    <span>{{ pagination.page }} / {{ pagination.lastPage }}</span>
    <Link
      v-if="pagination.page < pagination.lastPage"
      :href="base + (base.includes('?') ? '&' : '?') + 'page=' + (pagination.page + 1)"
      >{{ t('catalog', 'next') }}</Link
    >
  </nav>
</template>
