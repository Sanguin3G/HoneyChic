<script setup lang="ts">
import { useForm } from '@inertiajs/vue3'
import { PhHeart } from '@phosphor-icons/vue'
import HcButton from '~/app/design/HcButton.vue'
import { useI18n } from '~/app/shared/i18n'
const props = defineProps<{ slug: string; saved: boolean }>()
const { t } = useI18n()
const form = useForm({ slug: props.slug, save: !props.saved, module: '' })
function toggle() {
  form.save = !props.saved
  form.post('/account/wishlist', { preserveScroll: true })
}
</script>
<template>
  <div>
    <HcButton variant="quiet" :aria-pressed="saved" :disabled="form.processing" @click="toggle">
      <PhHeart :size="20" :weight="saved ? 'fill' : 'regular'" aria-hidden="true" />{{
        t('modules', saved ? 'removeWishlist' : 'saveWishlist')
      }}
    </HcButton>
    <p v-for="(error, key) in form.errors" :key="key" class="hc-error" role="alert">{{ error }}</p>
  </div>
</template>
