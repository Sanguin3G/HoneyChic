<script setup lang="ts">
import { watch } from 'vue'
import { Head, Link, useForm } from '@inertiajs/vue3'
import AdminLayout from '~/app/layouts/AdminLayout.vue'
import HcButton from '~/app/design/HcButton.vue'
import HcPanel from '~/app/design/HcPanel.vue'
import HcNotice from '~/app/design/HcNotice.vue'
import OrderPayment from '~/modules/payments/OrderPayment.vue'
import OrderDetails from '~/features/orders/OrderDetails.vue'
import type { OrderDetail } from '~/features/orders/types'
import { useI18n } from '~/app/shared/i18n'
const props = defineProps<{
  order: OrderDetail
  payment: { method: 'cod' | 'fake'; status: string } | null
  transitions: string[]
}>()
const { t } = useI18n()
const form = useForm({ status: props.transitions[0] ?? '', checkout: '' })
watch(
  () => props.transitions,
  (transitions) => {
    form.status = transitions[0] ?? ''
    form.clearErrors()
  }
)
function save() {
  if (window.confirm(t('admin', 'confirmation')))
    form.patch('/admin/orders/' + props.order.publicId)
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
  </AdminLayout>
</template>
