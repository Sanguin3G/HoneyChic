<script setup lang="ts">
import { computed, ref } from 'vue'
import { PhCheckCircle, PhMinusCircle } from '@phosphor-icons/vue'
import { useI18n } from '~/app/shared/i18n'
import { formatMoney } from '~/app/shared/money'
import ProductGallery from './ProductGallery.vue'
import AddCartForm from '~/features/cart/AddCartForm.vue'
import VariantPicker from './VariantPicker.vue'
import type { ProductDetail } from './types'
const props = defineProps<{ product: ProductDetail }>()
const { t, locale } = useI18n()
const selectedId = ref(
  props.product.variants.find((variant) => variant.available)?.id ?? props.product.variants[0].id
)
const variant = computed(() => props.product.variants.find((item) => item.id === selectedId.value)!)
</script>
<template>
  <div class="product-detail">
    <ProductGallery :images="product.images" />
    <section class="product-information">
      <p class="eyebrow">{{ product.category?.name || t('catalog', 'uncategorized') }}</p>
      <h1>{{ product.name }}</h1>
      <div class="buy-box hc-panel">
        <div class="product-purchase-summary" aria-live="polite" aria-atomic="true">
          <p class="product-price price">
            {{ formatMoney(variant.priceMinor, variant.currency, locale) }}
          </p>
          <p class="product-stock" :data-available="variant.available">
            <PhCheckCircle v-if="variant.available" :size="16" weight="fill" aria-hidden="true" />
            <PhMinusCircle v-else :size="16" weight="fill" aria-hidden="true" />{{
              t('inventory', variant.available ? 'available' : 'out')
            }}
          </p>
        </div>
        <VariantPicker
          v-model="selectedId"
          :options="product.options"
          :variants="product.variants"
        />
        <AddCartForm :variant-id="variant.id" :available="variant.available" />
        <p class="product-sku">
          {{ t('catalog', 'sku') }} <strong>{{ variant.sku }}</strong>
        </p>
      </div>
      <div class="product-copy">
        <h2>{{ t('storefront', 'details') }}</h2>
        <p class="product-description">{{ product.description }}</p>
      </div>
    </section>
  </div>
</template>
