<script setup lang="ts">
import { Head, Link, router } from '@inertiajs/vue3'
import AccountLayout from '~/app/layouts/AccountLayout.vue'
import HcButton from '~/app/design/HcButton.vue'
import HcPanel from '~/app/design/HcPanel.vue'
import ProductCard from '~/features/catalog/ProductCard.vue'
import { useI18n } from '~/app/shared/i18n'
import type { ProductSummary } from '~/features/catalog/types'
defineProps<{ products: ProductSummary[]; unavailableIds: number[] }>()
const { t } = useI18n()
</script>
<template>
  <Head :title="t('modules', 'wishlist')"><meta name="robots" content="noindex,nofollow" /></Head>
  <AccountLayout
    ><HcPanel
      ><h1>{{ t('modules', 'wishlist') }}</h1>
      <p v-if="!products.length">{{ t('modules', 'emptyWishlist') }}</p>
      <div class="product-grid">
        <div v-for="product in products" :key="product.id">
          <ProductCard :product="product" />
          <HcButton
            variant="quiet"
            @click="router.post('/account/wishlist', { slug: product.slug, save: false })"
            >{{ t('modules', 'removeWishlist') }}</HcButton
          >
        </div>
      </div>
      <div v-for="id in unavailableIds" :key="id">
        <p>{{ t('cart', 'unavailable') }}</p>
        <HcButton variant="quiet" @click="router.delete('/account/wishlist/' + id)">{{
          t('modules', 'removeWishlist')
        }}</HcButton>
      </div>
      <Link href="/products">{{ t('catalog', 'products') }}</Link>
    </HcPanel></AccountLayout
  >
</template>
