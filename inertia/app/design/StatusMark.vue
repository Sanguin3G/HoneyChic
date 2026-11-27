<script setup lang="ts">
import type { StatusTone } from './status_tone'
defineProps<{ tone: StatusTone }>()
</script>

<template>
  <span class="status-mark" :data-state="tone"><slot /></span>
</template>

<style scoped>
/* A small bezel pill with a lit dot, like a status light. */
.status-mark {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.1rem 0.55rem 0.1rem 0.4rem;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: var(--gel-silver);
  color: var(--ink-soft);
  font-size: 0.78rem;
  font-weight: 700;
  white-space: nowrap;
  box-shadow: var(--shadow-control);
}
.status-mark::before {
  content: '';
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, #ffffffb0, currentColor 65%);
  box-shadow: 0 0 0 1px rgb(0 0 0 / 15%);
}
.status-mark[data-state='success']::before {
  color: var(--success);
  background-color: var(--success);
}
.status-mark[data-state='success'] {
  color: #24562f;
}
.status-mark[data-state='warning'] {
  color: #6b4500;
}
.status-mark[data-state='warning']::before {
  background-color: #d99a20;
}
.status-mark[data-state='danger'] {
  color: var(--danger);
}
.status-mark[data-state='muted'] {
  color: var(--text-muted);
}
</style>
