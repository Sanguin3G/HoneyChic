<script setup lang="ts">
import { Link, usePage } from '@inertiajs/vue3'
import { PhArrowRight } from '@phosphor-icons/vue'
import { useI18n, type SharedProps } from '~/app/shared/i18n'
import type { ProductSummary } from '~/features/catalog/types'
defineProps<{ product?: ProductSummary }>()
const page = usePage<SharedProps>()
const { t } = useI18n()
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
    <Link v-if="product?.image" class="shop-hero-product" :href="'/products/' + product.slug"
      ><img :src="product.image.url" :alt="product.image.altText" width="480" height="340" /><span
        >{{ product.name }}<PhArrowRight :size="20" aria-hidden="true" /></span
    ></Link>
  </section>
</template>
