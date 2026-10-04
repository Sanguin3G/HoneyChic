<script setup lang="ts">
import { usePage } from '@inertiajs/vue3'
import type { SharedProps } from '~/app/shared/i18n'
import type { OrderDetail } from './types'
import HcPanel from '~/app/design/HcPanel.vue'
import { useI18n } from '~/app/shared/i18n'
import { formatMoney } from '~/app/shared/money'
defineProps<{ order: OrderDetail }>()
const page = usePage<SharedProps>()
const { t, locale } = useI18n()
</script>
<template>
  <HcPanel>
    <h1>{{ order.number }}</h1>
    <dl class="order-facts">
      <div>
        <dt>{{ t('orders', 'status') }}</dt>
        <dd>{{ t('orders', order.status) }}</dd>
      </div>
      <div>
        <dt>{{ t('orders', 'payment') }}</dt>
        <dd>{{ t('orders', order.paymentStatus) }}</dd>
      </div>
      <div>
        <dt>{{ t('orders', 'date') }}</dt>
        <dd>
          {{
            new Date(order.createdAt).toLocaleString(locale, {
              timeZone: page.props.store.timezone,
            })
          }}
        </dd>
      </div>
    </dl>
    <ul class="order-lines">
      <li v-for="item in order.items" :key="item.id">
        <strong>{{ item.productName }}</strong>
        <p>{{ item.variantDescription }}</p>
        <p>{{ t('orders', 'sku') }}: {{ item.sku }}</p>
        <p>
          {{ t('orders', 'quantity') }}: {{ item.quantity }} · {{ t('orders', 'unitPrice') }}:
          {{ formatMoney(item.unitPriceMinor, order.currency, locale) }}
        </p>
      </li>
    </ul>
    <p v-if="order.discountMinor">
      {{ t('modules', 'discount') }} ({{ order.couponCode }}): −{{
        formatMoney(order.discountMinor, order.currency, locale)
      }}
    </p>
    <p v-if="order.shippingName">
      {{ t('modules', 'shipping') }} ({{ order.shippingName }}):
      {{ formatMoney(order.shippingMinor, order.currency, locale) }}
    </p>
    <p class="order-total">
      <strong
        >{{ t('orders', 'total') }}:
        {{ formatMoney(order.totalMinor, order.currency, locale) }}</strong
      >
    </p>
  </HcPanel>
  <HcPanel>
    <h2>{{ t('orders', 'customer') }}</h2>
    <p>{{ order.customerName }}</p>
    <p>{{ order.customerEmail }}</p>
    <p>{{ order.customerPhone }}</p>
    <h3>{{ t('orders', 'address') }}</h3>
    <p class="preserve-lines">{{ order.deliveryAddress }}</p>
    <template v-if="order.note"
      ><h3>{{ t('orders', 'note') }}</h3>
      <p class="preserve-lines">{{ order.note }}</p></template
    >
  </HcPanel>
</template>
