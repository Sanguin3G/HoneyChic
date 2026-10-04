<script setup lang="ts">
import { usePage } from '@inertiajs/vue3'
import { useI18n, type SharedProps } from '~/app/shared/i18n'
import type { Movement } from './types'
defineProps<{ movements: Movement[] }>()
const page = usePage<SharedProps>()
const { t, locale } = useI18n()
function timestamp(value: string) {
  return new Intl.DateTimeFormat(locale.value, {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: page.props.store.timezone,
  }).format(new Date(value))
}
</script>
<template>
  <h2>{{ t('inventory', 'history') }}</h2>
  <div class="table-scroll">
    <table class="catalog-table">
      <thead>
        <tr>
          <th>{{ t('inventory', 'timestamp') }}</th>
          <th>{{ t('inventory', 'quantityDelta') }}</th>
          <th>{{ t('inventory', 'stockAfter') }}</th>
          <th>{{ t('inventory', 'reason') }}</th>
          <th>{{ t('inventory', 'actor') }}</th>
          <th>{{ t('inventory', 'reference') }}</th>
          <th>{{ t('inventory', 'note') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="movement in movements" :key="movement.id">
          <td>
            <time :datetime="movement.createdAt">{{ timestamp(movement.createdAt) }}</time>
          </td>
          <td>{{ movement.quantityDelta > 0 ? '+' : '' }}{{ movement.quantityDelta }}</td>
          <td>{{ movement.stockAfter }}</td>
          <td>{{ t('inventory', movement.reason) }}</td>
          <td>{{ movement.actor ?? t('inventory', 'system') }}</td>
          <td>{{ movement.reference }}</td>
          <td class="movement-note">{{ movement.note }}</td>
        </tr>
      </tbody>
    </table>
  </div>
  <p v-if="!movements.length">{{ t('inventory', 'noMovements') }}</p>
</template>
<style scoped>
.movement-note {
  min-width: 12rem;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
</style>
