<script setup lang="ts">
import { Link } from '@inertiajs/vue3'
import { PhArrowUpRight, PhImage } from '@phosphor-icons/vue'
import { useI18n } from '~/app/shared/i18n'
import { formatMoney } from '~/app/shared/money'
import type { ProductSummary } from './types'
defineProps<{ product: ProductSummary }>()
const { t, locale } = useI18n()
</script>
<template>
  <article class="product-card">
    <Link :href="'/products/' + product.slug">
      <div class="product-card-image">
        <img
          v-if="product.image"
          :src="product.image.url"
          :alt="product.image.altText"
          width="480"
          height="340"
          loading="lazy"
        />
        <div v-else class="product-placeholder">
          <PhImage :size="40" aria-hidden="true" />{{ t('catalog', 'noImage') }}
        </div>
        <PhArrowUpRight class="product-card-arrow" :size="22" aria-hidden="true" />
      </div>
      <div class="product-card-copy">
        <p class="product-card-category">{{ product.category?.name }}</p>
        <h2>{{ product.name }}</h2>
        <strong v-if="product.priceMinor !== null && product.currency"
          ><span v-if="product.hasVariants">{{ t('catalog', 'from') }} </span
          >{{ formatMoney(product.priceMinor, product.currency, locale) }}</strong
        >
        <p class="product-availability" :data-available="product.available">
          <span aria-hidden="true" class="availability-dot"></span
          >{{ t('inventory', product.available ? 'available' : 'out') }}
        </p>
      </div>
    </Link>
  </article>
</template>
