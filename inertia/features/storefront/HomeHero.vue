<script setup lang="ts">
import { Link, usePage } from '@inertiajs/vue3'
import { PhArrowRight } from '@phosphor-icons/vue'
import { useI18n, type SharedProps } from '~/app/shared/i18n'
import { formatMoney } from '~/app/shared/money'
import type { ProductSummary } from '~/features/catalog/types'
defineProps<{ product?: ProductSummary }>()
const page = usePage<SharedProps>()
const { t, locale } = useI18n()
</script>
<template>
  <section class="shop-hero">
    <div class="shop-hero-copy">
      <p class="eyebrow">{{ t('storefront', 'welcome') }}</p>
      <h1>{{ page.props.store.name }}</h1>
      <p class="intro">{{ page.props.store.description || t('storefront', 'intro') }}</p>
      <Link class="hc-button hc-button--primary" href="/products"
        >{{ t('storefront', 'browse') }}<PhArrowRight :size="20" aria-hidden="true"
      /></Link>
    </div>
    <Link v-if="product" class="shop-hero-product" :href="'/products/' + product.slug">
      <img
        v-if="product.image"
        :src="product.image.url"
        :alt="product.image.altText"
        width="480"
        height="340"
        fetchpriority="high"
      />
      <span class="shop-hero-caption">
        <strong>{{ product.name }}</strong>
        <span v-if="product.priceMinor !== null && product.currency" class="shop-hero-price">
          <template v-if="product.hasVariants">{{ t('catalog', 'from') + '\u00a0' }}</template
          >{{ formatMoney(product.priceMinor, product.currency, locale) }}
        </span>
      </span>
    </Link>
  </section>
</template>
