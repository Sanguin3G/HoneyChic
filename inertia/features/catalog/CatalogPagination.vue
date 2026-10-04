<script setup lang="ts">
import { Link } from '@inertiajs/vue3'
import { useI18n } from '~/app/shared/i18n'
import type { Pagination } from './types'
const props = defineProps<{
  pagination: Pagination
  base: string
  filters?: Record<string, string>
}>()
const { t } = useI18n()
function href(page: number) {
  const query = new URLSearchParams({ page: String(page) })
  for (const [key, value] of Object.entries(props.filters ?? {})) if (value) query.set(key, value)
  return props.base + '?' + query.toString()
}
</script>
<template>
  <nav v-if="pagination.lastPage > 1" class="form-actions" :aria-label="t('catalog', 'page')">
    <Link v-if="pagination.page > 1" :href="href(pagination.page - 1)">{{
      t('catalog', 'previous')
    }}</Link>
    <span>{{ t('catalog', 'page') }} {{ pagination.page }} / {{ pagination.lastPage }}</span>
    <Link v-if="pagination.page < pagination.lastPage" :href="href(pagination.page + 1)">{{
      t('catalog', 'next')
    }}</Link>
  </nav>
</template>
