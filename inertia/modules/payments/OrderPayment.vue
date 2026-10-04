<script setup lang="ts">
import { useForm, usePage } from '@inertiajs/vue3'
import HcPanel from '~/app/design/HcPanel.vue'
import HcButton from '~/app/design/HcButton.vue'
import { useI18n, type SharedProps } from '~/app/shared/i18n'
const props = defineProps<{
  orderId: string
  status: string
  payment: { method: 'cod' | 'fake'; status: string } | null
  admin?: boolean
}>()
const page = usePage<SharedProps>()
const { t } = useI18n()
const form = useForm({ module: '' })
function pay() {
  if (!window.confirm(t('modules', props.admin ? 'collectConfirm' : 'simulateConfirm'))) return
  form.post(
    props.admin
      ? '/admin/orders/' + props.orderId + '/payment'
      : '/orders/' + props.orderId + '/payment/simulate'
  )
}
</script>
<template>
  <HcPanel v-if="payment">
    <h2>{{ t('modules', 'paymentMethod') }}</h2>
    <p>
      {{ t('modules', payment.method) }} ·
      {{ t('orders', payment.status === 'paid' ? 'paid' : 'unpaid') }}
    </p>
    <HcButton
      v-if="
        payment.status !== 'paid' &&
        ((admin &&
          payment.method === 'cod' &&
          ['processing', 'shipped', 'completed'].includes(status) &&
          page.props.capabilities['payments.cod'].available) ||
          (!admin &&
            payment.method === 'fake' &&
            ['pending', 'processing'].includes(status) &&
            page.props.capabilities['payments.fake'].available))
      "
      :disabled="form.processing"
      @click="pay"
    >
      {{ t('modules', admin ? 'collectPayment' : 'simulatePayment') }}
    </HcButton>
    <p v-for="(error, key) in form.errors" :key="key" class="hc-error" role="alert">{{ error }}</p>
  </HcPanel>
</template>
