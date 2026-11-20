<script setup lang="ts">
import { computed } from 'vue'
import { usePage } from '@inertiajs/vue3'
import type { SharedProps } from '~/app/shared/i18n'
import type { OrderDetail } from './types'
import HcPanel from '~/app/design/HcPanel.vue'
import StatusMark from '~/app/design/StatusMark.vue'
import { statusTone } from '~/app/design/status_tone'
import { useI18n } from '~/app/shared/i18n'
import { formatMoney } from '~/app/shared/money'
const props = defineProps<{ order: OrderDetail }>()
const page = usePage<SharedProps>()
const { t, locale } = useI18n()
const itemsById = computed(() => new Map(props.order.items.map((item) => [item.id, item])))
function itemLabel(orderItemId: number) {
  const item = itemsById.value.get(orderItemId)
  return item ? `${item.productName} (${item.sku})` : `#${orderItemId}`
}
</script>
<template>
  <HcPanel>
    <h1>{{ order.number }}</h1>
    <dl class="order-facts">
      <div>
        <dt>{{ t('orders', 'status') }}</dt>
        <dd>
          <StatusMark :tone="statusTone(order.status)">{{ t('orders', order.status) }}</StatusMark>
        </dd>
      </div>
      <div>
        <dt>{{ t('orders', 'payment') }}</dt>
        <dd>
          <StatusMark :tone="statusTone(order.paymentStatus)">{{
            t('orders', order.paymentStatus)
          }}</StatusMark>
        </dd>
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
        <p v-if="(item.returnedQuantity ?? 0) > 0">
          {{ t('orders', 'returned') }}: {{ item.returnedQuantity }}
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
    <p v-if="(order.refundedMinor ?? 0) > 0">
      {{ t('orders', 'refundedAmount') }}:
      {{ formatMoney(order.refundedMinor ?? 0, order.currency, locale) }}
    </p>
  </HcPanel>
  <HcPanel v-if="(order.refunds?.length ?? 0) > 0">
    <h2>{{ t('orders', 'refunds') }}</h2>
    <ul class="order-lines">
      <li v-for="refund in order.refunds" :key="refund.id">
        <strong>{{ formatMoney(refund.amountMinor, order.currency, locale) }}</strong> ·
        {{ refund.reference }}
        <span v-if="refund.createdAt">
          ·
          {{
            new Date(refund.createdAt).toLocaleString(locale, {
              timeZone: page.props.store.timezone,
            })
          }}
        </span>
        <p v-if="refund.note" class="preserve-lines">{{ refund.note }}</p>
      </li>
    </ul>
  </HcPanel>
  <HcPanel v-if="(order.returns?.length ?? 0) > 0">
    <h2>{{ t('orders', 'returns') }}</h2>
    <ul class="order-lines">
      <li v-for="ret in order.returns" :key="ret.id">
        <strong>{{ itemLabel(ret.orderItemId) }}</strong> · {{ t('orders', 'quantity') }}:
        {{ ret.quantity }} · {{ ret.reference }}
        <span v-if="ret.createdAt">
          ·
          {{
            new Date(ret.createdAt).toLocaleString(locale, {
              timeZone: page.props.store.timezone,
            })
          }}
        </span>
        <p v-if="ret.note" class="preserve-lines">{{ ret.note }}</p>
      </li>
    </ul>
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
