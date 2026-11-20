<script setup lang="ts">
import { computed, watch } from 'vue'
import { Head, Link, useForm } from '@inertiajs/vue3'
import AdminLayout from '~/app/layouts/AdminLayout.vue'
import HcButton from '~/app/design/HcButton.vue'
import HcInput from '~/app/design/HcInput.vue'
import HcPanel from '~/app/design/HcPanel.vue'
import HcNotice from '~/app/design/HcNotice.vue'
import OrderPayment from '~/modules/payments/OrderPayment.vue'
import OrderDetails from '~/features/orders/OrderDetails.vue'
import type { OrderDetail } from '~/features/orders/types'
import { useI18n } from '~/app/shared/i18n'
import { formatMoney } from '~/app/shared/money'
const props = defineProps<{
  order: OrderDetail
  payment: { method: 'cod' | 'fake'; status: string } | null
  transitions: string[]
}>()
const { t, locale } = useI18n()
const form = useForm({ status: props.transitions[0] ?? '', checkout: '' })
const remainingRefundMinor = computed(() =>
  Math.max(0, props.order.totalMinor - (props.order.refundedMinor ?? 0))
)
const refundForm = useForm({
  amountMinor: remainingRefundMinor.value,
  reference: '',
  note: '',
  checkout: '',
})
const returnableItems = computed(() =>
  props.order.items.filter((item) => item.quantity > (item.returnedQuantity ?? 0))
)
const returnForm = useForm({
  orderItemId: returnableItems.value[0]?.id ?? 0,
  quantity: 1,
  reference: '',
  note: '',
  checkout: '',
})
const selectedReturnMax = computed(() => {
  const item = returnableItems.value.find((row) => row.id === Number(returnForm.orderItemId))
  return item ? item.quantity - (item.returnedQuantity ?? 0) : 1
})
const refundPreview = computed(() => {
  const num = Number(refundForm.amountMinor)
  if (!Number.isSafeInteger(num) || num < 1) return ''
  try {
    return formatMoney(num, props.order.currency, locale.value)
  } catch {
    return `${props.order.currency} ${num}`
  }
})
watch(
  () => props.transitions,
  (transitions) => {
    form.status = transitions[0] ?? ''
    form.clearErrors()
  }
)
watch(remainingRefundMinor, (remaining) => {
  refundForm.amountMinor = remaining
  refundForm.reference = ''
  refundForm.note = ''
  refundForm.clearErrors()
})
watch(returnableItems, (items) => {
  if (!items.some((item) => item.id === Number(returnForm.orderItemId))) {
    returnForm.orderItemId = items[0]?.id ?? 0
  }
  returnForm.quantity = 1
  returnForm.reference = ''
  returnForm.note = ''
  returnForm.clearErrors()
})
function save() {
  if (window.confirm(t('admin', 'confirmation')))
    form.patch('/admin/orders/' + props.order.publicId)
}
function submitRefund() {
  refundForm.post('/admin/orders/' + props.order.publicId + '/refunds', { preserveScroll: true })
}
function submitReturn() {
  returnForm.post('/admin/orders/' + props.order.publicId + '/returns', { preserveScroll: true })
}
</script>
<template>
  <Head :title="order.number"><meta name="robots" content="noindex,nofollow" /></Head>
  <AdminLayout
    ><HcNotice /><Link href="/admin/orders">{{ t('orders', 'back') }}</Link
    ><OrderDetails :order="order" />
    <OrderPayment :order-id="order.publicId" :status="order.status" :payment="payment" admin />
    <HcPanel v-if="transitions.length">
      <form class="admin-filters" @submit.prevent="save">
        <label class="hc-field" for="next-status"
          >{{ t('orders', 'status')
          }}<select id="next-status" v-model="form.status" class="hc-input">
            <option v-for="status in transitions" :key="status" :value="status">
              {{ t('orders', status) }}
            </option>
          </select></label
        >
        <HcButton type="submit" :disabled="form.processing">{{
          t('admin', 'statusSave')
        }}</HcButton>
      </form>
      <p v-for="(error, key) in form.errors" :key="key" class="hc-error" role="alert">
        {{ error }}
      </p>
      <p class="hc-help">{{ t('admin', 'paymentHelp') }}</p>
    </HcPanel>
    <HcPanel
      v-if="
        order.paymentStatus === 'paid' && order.status !== 'cancelled' && remainingRefundMinor > 0
      "
    >
      <h2>{{ t('orders', 'recordRefund') }}</h2>
      <form class="hc-form" @submit.prevent="submitRefund">
        <HcInput
          id="refund-amount"
          v-model="refundForm.amountMinor"
          type="number"
          :label="t('orders', 'refundAmountMinor')"
          :error="refundForm.errors.amountMinor"
          min="1"
          :max="remainingRefundMinor"
          step="1"
          required
        />
        <p v-if="refundPreview" class="hc-help">{{ refundPreview }}</p>
        <HcInput
          id="refund-reference"
          v-model="refundForm.reference"
          :label="t('orders', 'refundReference')"
          :error="refundForm.errors.reference"
          maxlength="100"
          required
        />
        <HcInput
          id="refund-note"
          v-model="refundForm.note"
          :label="t('orders', 'refundNote')"
          :error="refundForm.errors.note"
          maxlength="1000"
        />
        <p v-for="(error, key) in refundForm.errors" :key="key" class="hc-error" role="alert">
          {{ error }}
        </p>
        <HcButton type="submit" :disabled="refundForm.processing">{{
          t('orders', 'refundSave')
        }}</HcButton>
      </form>
    </HcPanel>
    <HcPanel v-if="order.status !== 'cancelled' && returnableItems.length > 0">
      <h2>{{ t('orders', 'recordReturn') }}</h2>
      <form class="hc-form" @submit.prevent="submitReturn">
        <label class="hc-field" for="return-item"
          >{{ t('orders', 'returnItem')
          }}<select
            id="return-item"
            v-model.number="returnForm.orderItemId"
            class="hc-input"
            required
          >
            <option v-for="item in returnableItems" :key="item.id" :value="item.id">
              {{ item.productName }} ({{ item.sku }}) —
              {{ item.quantity - (item.returnedQuantity ?? 0) }}
            </option>
          </select></label
        >
        <HcInput
          id="return-quantity"
          v-model="returnForm.quantity"
          type="number"
          :label="t('orders', 'returnQuantity')"
          :error="returnForm.errors.quantity"
          min="1"
          :max="selectedReturnMax"
          step="1"
          required
        />
        <HcInput
          id="return-reference"
          v-model="returnForm.reference"
          :label="t('orders', 'returnReference')"
          :error="returnForm.errors.reference"
          maxlength="100"
          required
        />
        <HcInput
          id="return-note"
          v-model="returnForm.note"
          :label="t('orders', 'returnNote')"
          :error="returnForm.errors.note"
          maxlength="1000"
        />
        <p v-for="(error, key) in returnForm.errors" :key="key" class="hc-error" role="alert">
          {{ error }}
        </p>
        <HcButton type="submit" :disabled="returnForm.processing">{{
          t('orders', 'returnSave')
        }}</HcButton>
      </form>
    </HcPanel>
  </AdminLayout>
</template>
