<script setup lang="ts">
import { useI18n } from '~/app/shared/i18n'
import type { InventoryVariant } from './types'
defineProps<{ state: InventoryVariant['state'] }>()
const { t } = useI18n()
</script>
<template>
  <span class="inventory-state" :data-state="state">{{ t('inventory', state) }}</span>
</template>
<style scoped>
.inventory-state {
  display: inline-block;
  padding: 0.15rem 0.5rem;
  border: 1px solid currentColor;
  border-radius: var(--radius-control);
  font-size: 0.875rem;
  font-weight: 650;
}
.inventory-state[data-state='available'] {
  color: var(--success);
}
.inventory-state[data-state='low'] {
  color: var(--warning);
}
.inventory-state[data-state='out'] {
  color: var(--danger);
}
.inventory-state[data-state='retired'] {
  color: var(--text-muted);
}
</style>
