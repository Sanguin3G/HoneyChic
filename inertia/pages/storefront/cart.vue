<script setup lang="ts">
import { computed } from 'vue'
import { Head, Link, useForm, usePage } from '@inertiajs/vue3'
import StorefrontLayout from '~/app/layouts/StorefrontLayout.vue'
import HcButton from '~/app/design/HcButton.vue'
import HcPanel from '~/app/design/HcPanel.vue'
import HcNotice from '~/app/design/HcNotice.vue'
import CartItemRow from '~/features/cart/CartItemRow.vue'
import type { CartView } from '~/features/cart/types'
import { useI18n, type SharedProps } from '~/app/shared/i18n'
import { formatMoney } from '~/app/shared/money'
defineProps<{ cart: CartView }>()
const { t, locale } = useI18n()
const clear = useForm({})
const page = usePage<SharedProps>()
const canCheckout = computed(() =>
  page.props.auth
    ? page.props.capabilities.customer_accounts.available
    : page.props.capabilities.guest_checkout.available
)
</script>
<template>
  <Head :title="t('cart', 'title')"><meta name="robots" content="noindex,nofollow" /></Head>
  <StorefrontLayout>
    <h1>{{ t('cart', 'title') }}</h1>
    <HcNotice />
    <div v-if="cart.items.length && cart.currency" class="cart-layout">
      <section :aria-label="t('cart', 'title')">
        <ul class="cart-items">
          <CartItemRow
            v-for="item in cart.items"
            :key="item.variantId"
            :item="item"
            :currency="cart.currency"
          />
        </ul>
        <div class="cart-toolbar">
          <Link class="hc-button hc-button--quiet" href="/products">{{
            t('cart', 'continue')
          }}</Link>
          <HcButton variant="quiet" :disabled="clear.processing" @click="clear.delete('/cart')">{{
            t('cart', 'clear')
          }}</HcButton>
        </div>
      </section>
      <HcPanel class="cart-summary">
        <h2>{{ t('cart', 'subtotal') }}</h2>
        <p v-if="cart.totalMinor !== null" class="cart-subtotal">
          {{ formatMoney(cart.totalMinor, cart.currency, locale) }}
        </p>
        <p v-else class="cart-warning" role="status">
          {{ t('cart', cart.amountLimited ? 'amountLimit' : 'resolveIssues') }}
        </p>
        <p>{{ t('cart', 'notReserved') }}</p>
        <Link
          v-if="cart.totalMinor !== null && canCheckout"
          class="hc-button hc-button--primary"
          href="/checkout"
          >{{ t('orders', 'checkout') }}</Link
        >
        <p v-if="!canCheckout">
          {{ t('orders', 'disabled') }}
          <Link
            v-if="!page.props.auth && page.props.capabilities.customer_accounts.available"
            href="/login"
            >{{ t('auth', 'login') }}</Link
          >
        </p>
        <p class="cart-limits">{{ t('cart', 'limits') }}</p>
      </HcPanel>
    </div>
    <HcPanel v-else class="cart-empty">
      <h2>{{ t('cart', 'emptyTitle') }}</h2>
      <p>{{ t('cart', 'emptyBody') }}</p>
      <Link class="hc-button hc-button--primary" href="/products">{{ t('cart', 'continue') }}</Link>
    </HcPanel>
  </StorefrontLayout>
</template>
