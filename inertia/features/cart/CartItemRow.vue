<script setup lang="ts">
import { Link, useForm } from '@inertiajs/vue3'
import { watch } from 'vue'
import HcButton from '~/app/design/HcButton.vue'
import { useI18n } from '~/app/shared/i18n'
import { formatMoney } from '~/app/shared/money'
import type { CartItem } from './types'
const props = defineProps<{ item: CartItem; currency: string }>()
const { t, locale } = useI18n()
const form = useForm({ quantity: props.item.quantity })
watch(
  () => props.item.quantity,
  (quantity) => {
    form.quantity = quantity
  }
)
const endpoint = '/cart/items/' + props.item.variantId
function update() {
  form.patch(endpoint, { preserveScroll: true })
}
function remove() {
  form.delete(endpoint, { preserveScroll: true })
}
</script>
<template>
  <li class="cart-line">
    <img
      v-if="item.product?.image"
      :src="item.product.image.url"
      :alt="item.product.image.altText"
      width="128"
      height="91"
    />
    <div class="cart-line-information">
      <template v-if="item.product">
        <h2>
          <Link :href="'/products/' + item.product.slug">{{ item.product.name }}</Link>
        </h2>
        <p v-if="item.product.description">{{ item.product.description }}</p>
        <p class="cart-sku">{{ t('catalog', 'sku') }}: {{ item.product.sku }}</p>
      </template>
      <h2 v-else>{{ t('cart', 'unavailable') }}</h2>
      <p v-if="item.unitPriceMinor !== null">
        {{ t('cart', 'unitPrice') }}: {{ formatMoney(item.unitPriceMinor, currency, locale) }}
      </p>
      <p v-if="item.priceChanged" class="cart-warning" role="status">
        {{ t('cart', 'priceChanged') }}
        <span v-if="item.previousPriceMinor !== null"
          >{{ t('cart', 'previousPrice') }}:
          {{ formatMoney(item.previousPriceMinor, currency, locale) }}</span
        >
      </p>
      <p v-if="item.issue" class="cart-warning">{{ t('cart', item.issue) }}</p>
      <p v-if="item.amountLimited" class="cart-warning">{{ t('cart', 'amountLimit') }}</p>
      <form
        v-if="item.product && item.issue !== 'unavailable'"
        class="cart-quantity-form"
        @submit.prevent="update"
      >
        <label :for="'cart-quantity-' + item.variantId">{{ t('cart', 'quantity') }}</label>
        <input
          :id="'cart-quantity-' + item.variantId"
          v-model.number="form.quantity"
          type="number"
          class="hc-input"
          min="1"
          max="99"
          required
          :disabled="form.processing"
          :aria-invalid="!!form.errors.quantity"
          :aria-describedby="form.errors.quantity ? 'cart-error-' + item.variantId : undefined"
        />
        <HcButton type="submit" variant="quiet" :disabled="form.processing">{{
          t('cart', 'update')
        }}</HcButton>
      </form>
      <p v-else>{{ t('cart', 'quantity') }}: {{ item.quantity }}</p>
      <p
        v-if="form.errors.quantity"
        :id="'cart-error-' + item.variantId"
        class="hc-error"
        role="alert"
      >
        {{ form.errors.quantity }}
      </p>
    </div>
    <div class="cart-line-actions">
      <p v-if="item.lineTotalMinor !== null">
        <span>{{ t('cart', 'lineTotal') }}</span>
        <strong>{{ formatMoney(item.lineTotalMinor, currency, locale) }}</strong>
      </p>
      <HcButton variant="quiet" :disabled="form.processing" @click="remove">{{
        t('cart', 'remove')
      }}</HcButton>
    </div>
  </li>
</template>
