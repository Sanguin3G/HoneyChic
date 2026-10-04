<script setup lang="ts">
import { ref, computed } from 'vue'
import { PhImage } from '@phosphor-icons/vue'
import HcButton from '~/app/design/HcButton.vue'
import { useI18n } from '~/app/shared/i18n'
import type { ProductDetail } from './types'
const props = defineProps<{ images: ProductDetail['images'] }>()
const { t } = useI18n()
const index = ref(
  Math.max(
    0,
    props.images.findIndex((image) => image.isPrimary)
  )
)
const image = computed(() => props.images[index.value])
</script>
<template>
  <div class="product-gallery">
    <div class="product-image-stage">
      <img v-if="image" :src="image.url" :alt="image.altText" width="480" height="340" />
      <div v-else class="product-placeholder">
        <PhImage :size="48" aria-hidden="true" />{{ t('catalog', 'noImage') }}
      </div>
    </div>
    <div
      v-if="images.length > 1"
      class="product-thumbnails"
      role="group"
      :aria-label="t('catalog', 'imageGallery')"
    >
      <HcButton
        v-for="(item, position) in images"
        :key="item.storageKey"
        variant="quiet"
        :aria-pressed="position === index"
        :aria-label="item.altText || t('storefront', 'image') + ' ' + (position + 1)"
        @click="index = position"
        ><img :src="item.url" alt="" width="80" height="57"
      /></HcButton>
    </div>
  </div>
</template>
