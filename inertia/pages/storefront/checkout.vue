<script setup lang="ts">
import { Head, Link } from '@inertiajs/vue3'
import StorefrontLayout from '~/app/layouts/StorefrontLayout.vue'
import HcPanel from '~/app/design/HcPanel.vue'
import CheckoutOptions from '~/modules/checkout/CheckoutOptions.vue'
import CheckoutForm from '~/features/orders/CheckoutForm.vue'
import type { Address } from '~/features/orders/types'
import type { CartView } from '~/features/cart/types'
import { useI18n } from '~/app/shared/i18n'
import { formatMoney } from '~/app/shared/money'
defineProps<{
  enabled: boolean
  token?: string
  cart?: CartView
  addresses?: Address[]
  pricing?: { totalMinor: number; discountMinor: number; shippingMinor: number } | null
  rates?: { id: number; name: string; countries: string[] }[]
  selections?: {
    shippingRateId?: number
    country: string
    couponCode: string
    paymentMethod?: 'cod' | 'fake'
  }
}>()
const { t, locale } = useI18n()
</script>
<template>
  <Head :title="t('orders', 'checkout')"><meta name="robots" content="noindex,nofollow" /></Head>
  <StorefrontLayout>
    <h1>{{ t('orders', 'checkout') }}</h1>
    <HcPanel v-if="!enabled"
      ><p>{{ t('orders', 'disabled') }}</p>
      <Link href="/login">{{ t('auth', 'login') }}</Link></HcPanel
    >
    <div v-else-if="cart && token" class="cart-layout">
      <HcPanel v-if="cart.totalMinor !== null && cart.currency"
        ><h2>{{ t('orders', 'review') }}</h2>
        <CheckoutOptions
          :rates="rates ?? []"
          :selections="selections ?? { country: '', couponCode: '' }" />
        <p v-if="!pricing">{{ t('modules', 'optionsRequired') }}</p>
        <CheckoutForm
          v-if="pricing"
          :token="token"
          :total-minor="pricing.totalMinor"
          :currency="cart.currency"
          :addresses="addresses ?? []"
      /></HcPanel>
      <HcPanel v-else
        ><p role="alert">{{ t('cart', 'resolveIssues') }}</p>
        <Link href="/cart">{{ t('orders', 'recheck') }}</Link></HcPanel
      >
      <HcPanel v-if="cart.currency">
        <ul class="order-lines">
          <li v-for="item in cart.items" :key="item.variantId">
            <strong>{{ item.product?.name ?? t('cart', 'unavailable') }}</strong>
            <p>{{ item.product?.description }}</p>
            <p>{{ t('orders', 'quantity') }}: {{ item.quantity }}</p>
            <p v-if="item.lineTotalMinor !== null">
              {{ formatMoney(item.lineTotalMinor, cart.currency, locale) }}
            </p>
            <p v-if="item.priceChanged" class="cart-warning">{{ t('cart', 'priceChanged') }}</p>
          </li>
        </ul>
        <p v-if="cart.totalMinor !== null && cart.currency" class="order-total">
          {{ t('orders', 'total') }}:
          {{ formatMoney(pricing?.totalMinor ?? cart.totalMinor, cart.currency, locale) }}
        </p>
        <p v-if="pricing?.discountMinor">
          {{ t('modules', 'discount') }}: −{{
            formatMoney(pricing.discountMinor, cart.currency, locale)
          }}
        </p>
        <p v-if="pricing">
          {{ t('modules', 'shipping') }}:
          {{ formatMoney(pricing.shippingMinor, cart.currency, locale) }}
        </p>
        <Link href="/cart">{{ t('orders', 'recheck') }}</Link>
      </HcPanel>
    </div>
  </StorefrontLayout>
</template>
