<script setup lang="ts">
import type { StatusTone } from './status_tone'
defineProps<{ tone: StatusTone }>()
</script>

<template>
  <span class="status-mark" :data-state="tone"><slot /></span>
</template>

<style scoped>
.status-mark {
  display: inline-block;
  padding: 0.15rem 0.5rem;
  border: 1px solid currentColor;
  border-radius: var(--radius-control);
  font-size: 0.875rem;
  font-weight: 650;
}
.status-mark[data-state='success'] {
  color: var(--success);
}
.status-mark[data-state='warning'] {
  color: var(--warning);
}
.status-mark[data-state='danger'] {
  color: var(--danger);
}
.status-mark[data-state='muted'] {
  color: var(--text-muted);
}
</style>
