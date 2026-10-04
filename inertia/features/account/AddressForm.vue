<script setup lang="ts">
import { useForm } from '@inertiajs/vue3'
import HcInput from '~/app/design/HcInput.vue'
import HcTextarea from '~/app/design/HcTextarea.vue'
import HcButton from '~/app/design/HcButton.vue'
import type { Address } from '~/features/orders/types'
import { useI18n } from '~/app/shared/i18n'
const props = defineProps<{ address?: Address }>()
const { t } = useI18n()
const form = useForm({
  label: props.address?.label ?? '',
  recipient: props.address?.recipient ?? '',
  phone: props.address?.phone ?? '',
  address: props.address?.address ?? '',
  checkout: '',
})
const prefix = 'address-' + (props.address?.id ?? 'new')
function save() {
  if (props.address) form.put('/account/addresses/' + props.address.id)
  else form.post('/account/addresses', { onSuccess: () => form.reset() })
}
</script>
<template>
  <form class="hc-form" @submit.prevent="save">
    <HcInput
      :id="prefix + '-label'"
      v-model="form.label"
      :label="t('orders', 'label')"
      :error="form.errors.label"
      maxlength="80"
      required
    />
    <HcInput
      :id="prefix + '-name'"
      v-model="form.recipient"
      :label="t('orders', 'name')"
      :error="form.errors.recipient"
      maxlength="120"
      required
    />
    <HcInput
      :id="prefix + '-phone'"
      v-model="form.phone"
      :label="t('orders', 'phone')"
      :error="form.errors.phone"
      type="tel"
      maxlength="40"
      required
    />
    <HcTextarea
      :id="prefix + '-text'"
      v-model="form.address"
      :label="t('orders', 'address')"
      :error="form.errors.address"
      maxlength="1000"
      required
    />
    <p v-if="form.errors.checkout" class="hc-error" role="alert">{{ form.errors.checkout }}</p>
    <HcButton type="submit" :disabled="form.processing">{{ t('orders', 'saveAddress') }}</HcButton>
  </form>
</template>
