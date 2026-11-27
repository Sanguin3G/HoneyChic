<script setup lang="ts">
import { Link, usePage } from '@inertiajs/vue3'
import { PhArrowRight, PhStorefront } from '@phosphor-icons/vue'
import { useI18n, type SharedProps } from '~/app/shared/i18n'
import { formatMoney } from '~/app/shared/money'
import type { ProductSummary } from '~/features/catalog/types'
defineProps<{ product?: ProductSummary; hasCategories: boolean }>()
const page = usePage<SharedProps>()
const { t, locale } = useI18n()
</script>
<template>
  <section class="shop-hero hc-panel hc-panel--titled" aria-labelledby="shop-hero-title">
    <div class="hc-titlebar shop-hero-bar" aria-hidden="true">
      <span class="shop-hero-bar-icon"><PhStorefront :size="14" weight="fill" /></span>
      <span>{{ page.props.store.name }}</span>
      <span class="shop-hero-bar-spacer"></span>
    </div>
    <div class="shop-hero-body">
      <div class="shop-hero-copy">
        <p class="eyebrow">{{ t('storefront', 'welcome') }}</p>
        <h1 id="shop-hero-title">{{ page.props.store.name }}</h1>
        <p class="intro">{{ page.props.store.description || t('storefront', 'intro') }}</p>
        <div class="hc-actions shop-hero-actions">
          <Link class="hc-button hc-button--primary" href="/products"
            >{{ t('storefront', 'browse') }}<PhArrowRight :size="18" aria-hidden="true"
          /></Link>
          <a v-if="hasCategories" class="hc-button" href="#categories">{{
            t('storefront', 'categories')
          }}</a>
        </div>
      </div>
      <Link v-if="product" class="shop-hero-product" :href="'/products/' + product.slug">
        <span class="photo-frame">
          <img
            v-if="product.image"
            :src="product.image.url"
            :alt="product.image.altText"
            width="480"
            height="360"
            fetchpriority="high"
          />
        </span>
        <span class="nameplate">
          <span class="nameplate-label">{{ t('storefront', 'featured') }}</span>
          <strong>{{ product.name }}</strong>
          <span v-if="product.priceMinor !== null && product.currency" class="price">
            <template v-if="product.hasVariants">{{ t('catalog', 'from') + '\u00a0' }}</template
            >{{ formatMoney(product.priceMinor, product.currency, locale) }}
          </span>
        </span>
      </Link>
    </div>
  </section>
</template>
