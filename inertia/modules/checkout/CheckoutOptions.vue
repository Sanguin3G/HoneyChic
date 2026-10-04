<script setup lang="ts">
import { useForm, usePage } from '@inertiajs/vue3'
import HcButton from '~/app/design/HcButton.vue'
import HcInput from '~/app/design/HcInput.vue'
import { useI18n, type SharedProps } from '~/app/shared/i18n'
const props = defineProps<{
  rates: { id: number; name: string; countries: string[] }[]
  selections: {
    shippingRateId?: number
    country: string
    couponCode: string
    paymentMethod?: 'cod' | 'fake'
  }
}>()
const page = usePage<SharedProps>()
const { t } = useI18n()
const form = useForm({
  shippingRateId: props.selections.shippingRateId ? String(props.selections.shippingRateId) : '',
  country: props.selections.country,
  couponCode: props.selections.couponCode,
  paymentMethod: props.selections.paymentMethod ?? '',
  module: '',
})
function submit() {
  form
    .transform((data) =>
      Object.fromEntries(Object.entries(data).filter(([, value]) => value !== ''))
    )
    .post('/checkout/options', { preserveScroll: true })
}
</script>
<template>
  <form
    v-if="
      page.props.capabilities.shipping.available ||
      page.props.capabilities.coupons.available ||
      page.props.capabilities['payments.cod'].available ||
      page.props.capabilities['payments.fake'].available
    "
    class="hc-form"
    @submit.prevent="submit"
  >
    <h2>{{ t('modules', 'checkoutOptions') }}</h2>
    <template v-if="page.props.capabilities.shipping.available">
      <label class="hc-field"
        >{{ t('modules', 'shipping') }}
        <select v-model="form.shippingRateId" class="hc-input" required>
          <option value="">{{ t('modules', 'selectShipping') }}</option>
          <option v-for="rate in rates" :key="rate.id" :value="String(rate.id)">
            {{ rate.name }}{{ rate.countries.length ? ' (' + rate.countries.join(', ') + ')' : '' }}
          </option>
        </select>
      </label>
      <HcInput
        id="shipping-country"
        v-model="form.country"
        :label="t('modules', 'country')"
        :error="form.errors.country"
        maxlength="2"
        required
      />
      <p class="hc-help">{{ t('modules', 'countryHelp') }}</p>
    </template>
    <HcInput
      v-if="page.props.capabilities.coupons.available"
      id="coupon-code"
      v-model="form.couponCode"
      :label="t('modules', 'couponCode')"
      maxlength="40"
    />
    <label
      v-if="
        page.props.capabilities['payments.cod'].available ||
        page.props.capabilities['payments.fake'].available
      "
      class="hc-field"
      >{{ t('modules', 'paymentMethod') }}
      <select v-model="form.paymentMethod" class="hc-input" required>
        <option value="">{{ t('modules', 'selectPayment') }}</option>
        <option v-if="page.props.capabilities['payments.cod'].available" value="cod">
          {{ t('modules', 'cod') }}
        </option>
        <option v-if="page.props.capabilities['payments.fake'].available" value="fake">
          {{ t('modules', 'fake') }}
        </option>
      </select>
    </label>
    <p v-for="(error, key) in form.errors" :key="key" class="hc-error" role="alert">{{ error }}</p>
    <HcButton type="submit" :disabled="form.processing">{{ t('modules', 'reviewTotal') }}</HcButton>
  </form>
</template>
