<script setup lang="ts">
import { router, usePage } from '@inertiajs/vue3'
import { ref, watch } from 'vue'
import { PhMagnifyingGlass } from '@phosphor-icons/vue'
import { useI18n } from '~/app/shared/i18n'
const { t } = useI18n()
const page = usePage<{ filters?: { q?: string } }>()
const q = ref(page.props.filters?.q ?? '')
watch(
  () => page.props.filters?.q,
  (value) => {
    q.value = value ?? ''
  }
)
function search() {
  router.get('/products', q.value.trim() ? { q: q.value.trim() } : {})
}
</script>
<template>
  <form
    class="store-search"
    role="search"
    :aria-label="t('storefront', 'search')"
    @submit.prevent="search"
  >
    <input
      v-model="q"
      type="search"
      :aria-label="t('storefront', 'search')"
      :placeholder="t('storefront', 'searchPlaceholder')"
      maxlength="200"
    />
    <button type="submit" :aria-label="t('storefront', 'search')">
      <PhMagnifyingGlass :size="22" aria-hidden="true" />
    </button>
  </form>
</template>
