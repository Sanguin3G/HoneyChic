<script setup lang="ts">
import { watch } from 'vue'
import { useForm, usePage } from '@inertiajs/vue3'
import HcInput from '~/app/design/HcInput.vue'
import HcTextarea from '~/app/design/HcTextarea.vue'
import { formatMoney } from '~/app/shared/money'
import HcButton from '~/app/design/HcButton.vue'
import type { Address } from './types'
import { useI18n, type SharedProps } from '~/app/shared/i18n'
const props = defineProps<{
  token: string
  totalMinor: number
  currency: string
  addresses: Address[]
}>()
const page = usePage<SharedProps>()
const { t, locale } = useI18n()
const form = useForm({
  token: props.token,
  customerName: page.props.auth?.fullName ?? '',
  customerEmail: page.props.auth?.email ?? '',
  customerPhone: '',
  deliveryAddress: '',
  note: '',
  expectedTotalMinor: props.totalMinor,
  checkout: '',
})
watch(
  () => [props.token, props.totalMinor] as const,
  ([token, total]) => {
    form.token = token
    form.expectedTotalMinor = total
  }
)
function selectAddress(event: Event) {
  const row = props.addresses.find(
    (address) => address.id === Number((event.target as HTMLSelectElement).value)
  )
  if (row) {
    form.customerName = row.recipient
    form.customerPhone = row.phone
    form.deliveryAddress = row.address
  }
}
</script>
<template>
  <form class="hc-form" @submit.prevent="form.post('/checkout')">
    <label v-if="addresses.length" class="hc-field"
      >{{ t('orders', 'savedAddresses') }}
      <select class="hc-input" @change="selectAddress">
        <option value="">{{ t('orders', 'selectAddress') }}</option>
        <option v-for="address in addresses" :key="address.id" :value="address.id">
          {{ address.label }}
        </option>
      </select>
      <span class="hc-help">{{ t('orders', 'addressHelp') }}</span>
    </label>
    <HcInput
      id="checkout-name"
      v-model="form.customerName"
      :label="t('orders', 'name')"
      :error="form.errors.customerName"
      autocomplete="name"
      maxlength="120"
      required
    />
    <HcInput
      id="checkout-email"
      v-model="form.customerEmail"
      :label="t('orders', 'email')"
      :error="form.errors.customerEmail"
      type="email"
      autocomplete="email"
      maxlength="254"
      required
    />
    <HcInput
      id="checkout-phone"
      v-model="form.customerPhone"
      :label="t('orders', 'phone')"
      :error="form.errors.customerPhone"
      type="tel"
      autocomplete="tel"
      maxlength="40"
      required
    />
    <HcTextarea
      id="checkout-address"
      v-model="form.deliveryAddress"
      :label="t('orders', 'address')"
      :error="form.errors.deliveryAddress"
      autocomplete="street-address"
      maxlength="1000"
      required
    />
    <HcTextarea
      id="checkout-note"
      v-model="form.note"
      :label="t('orders', 'note')"
      :error="form.errors.note"
      maxlength="2000"
    />
    <p
      v-if="form.errors.checkout || form.errors.token || form.errors.expectedTotalMinor"
      class="hc-error"
      role="alert"
    >
      {{ form.errors.checkout || form.errors.token || form.errors.expectedTotalMinor }}
    </p>
    <p class="hc-help">{{ t('orders', 'terms') }}</p>
    <p class="order-total">
      {{ t('orders', 'total') }}: {{ formatMoney(totalMinor, currency, locale) }}
    </p>
    <HcButton type="submit" :disabled="form.processing">{{ t('orders', 'place') }}</HcButton>
  </form>
</template>
