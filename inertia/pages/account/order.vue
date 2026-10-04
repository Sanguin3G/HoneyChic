<script setup lang="ts">
import { Head, Link, useForm } from '@inertiajs/vue3'
import StorefrontLayout from '~/app/layouts/StorefrontLayout.vue'
import HcButton from '~/app/design/HcButton.vue'
import HcNotice from '~/app/design/HcNotice.vue'
import OrderPayment from '~/modules/payments/OrderPayment.vue'
import OrderDetails from '~/features/orders/OrderDetails.vue'
import type { OrderDetail } from '~/features/orders/types'
import { useI18n } from '~/app/shared/i18n'
const props = defineProps<{
  order: OrderDetail
  payment: { method: 'cod' | 'fake'; status: string } | null
  canCancel: boolean
}>()
const { t } = useI18n()
const form = useForm({ checkout: '' })
function cancel() {
  if (window.confirm(t('orders', 'confirmCancel')))
    form.post('/orders/' + props.order.publicId + '/cancel')
}
</script>
<template>
  <Head :title="order.number"><meta name="robots" content="noindex,nofollow" /></Head>
  <StorefrontLayout
    ><HcNotice /><OrderDetails :order="order" />
    <OrderPayment :order-id="order.publicId" :status="order.status" :payment="payment" />
    <p v-for="(error, key) in form.errors" :key="key" class="hc-error" role="alert">{{ error }}</p>
    <div class="cart-toolbar">
      <Link href="/products">{{ t('orders', 'continue') }}</Link>
      <HcButton v-if="canCancel" :disabled="form.processing" @click="cancel">{{
        t('orders', 'cancel')
      }}</HcButton>
    </div>
  </StorefrontLayout>
</template>
