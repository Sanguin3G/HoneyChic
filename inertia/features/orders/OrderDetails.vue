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
    <ul class="order-lines receipt-lines">
      <li v-for="item in order.items" :key="item.id">
        <div>
          <strong>{{ item.productName }}</strong>
          <p v-if="item.variantDescription" class="hc-help">{{ item.variantDescription }}</p>
          <p class="hc-help">{{ t('orders', 'sku') }} {{ item.sku }}</p>
          <p v-if="(item.returnedQuantity ?? 0) > 0" class="hc-help">
            {{ t('orders', 'returned') }}: {{ item.returnedQuantity }}
          </p>
        </div>
        <p class="receipt-amount">
          {{ item.quantity }} × {{ formatMoney(item.unitPriceMinor, order.currency, locale) }}
        </p>
      </li>
    </ul>
    <dl class="checkout-charges">
      <div v-if="order.discountMinor">
        <dt>{{ t('modules', 'discount') }} ({{ order.couponCode }})</dt>
        <dd>−{{ formatMoney(order.discountMinor, order.currency, locale) }}</dd>
      </div>
      <div v-if="order.shippingName">
        <dt>{{ t('modules', 'shipping') }} ({{ order.shippingName }})</dt>
        <dd>{{ formatMoney(order.shippingMinor, order.currency, locale) }}</dd>
      </div>
    </dl>
    <p class="order-total">
      <span>{{ t('orders', 'total') }}</span>
      <span>{{ formatMoney(order.totalMinor, order.currency, locale) }}</span>
    </p>
    <p v-if="(order.refundedMinor ?? 0) > 0">
      {{ t('orders', 'refundedAmount') }}:
      {{ formatMoney(order.refundedMinor ?? 0, order.currency, locale) }}
    </p>
  </HcPanel>
  <HcPanel v-if="(order.refunds?.length ?? 0) > 0" :title="t('orders', 'refunds')">
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
  <HcPanel v-if="(order.returns?.length ?? 0) > 0" :title="t('orders', 'returns')">
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
  <HcPanel :title="t('orders', 'customer')">
    <p>
      <strong>{{ order.customerName }}</strong>
    </p>
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
