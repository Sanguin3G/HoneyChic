<script setup lang="ts">
import { Head } from '@inertiajs/vue3'
import AdminLayout from '~/app/layouts/AdminLayout.vue'
import HcPanel from '~/app/design/HcPanel.vue'
import ProductForm from '~/features/catalog/ProductForm.vue'
import { useI18n } from '~/app/shared/i18n'
import type { ProductFormData } from '~/features/catalog/types'
defineProps<{
  productId: number | null
  product: ProductFormData | null
  currency: string
  categories: { id: number; name: string }[]
}>()
const { t } = useI18n()
</script>
<template>
  <Head :title="t('catalog', productId ? 'editProduct' : 'newProduct')"
    ><meta name="robots" content="noindex"
  /></Head>
  <AdminLayout
    ><HcPanel
      ><h1>{{ t('catalog', productId ? 'editProduct' : 'newProduct') }}</h1>
      <ProductForm
        :key="productId ?? 'new'"
        :product-id="productId"
        :product="product"
        :currency="currency"
        :categories="categories"
      /> </HcPanel
  ></AdminLayout>
</template>
