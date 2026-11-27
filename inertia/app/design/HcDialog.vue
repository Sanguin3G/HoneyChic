<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { PhX } from '@phosphor-icons/vue'
import HcButton from './HcButton.vue'
import { useI18n } from '~/app/shared/i18n'
defineProps<{ id: string; title: string }>()
const open = defineModel<boolean>('open', { default: false })
const dialog = ref<HTMLDialogElement>()
const { t } = useI18n()
function sync() {
  if (!dialog.value) return
  if (open.value && !dialog.value.open) dialog.value.showModal()
  if (!open.value && dialog.value.open) dialog.value.close()
}
onMounted(sync)
watch(open, sync, { flush: 'post' })
function backdrop(event: MouseEvent) {
  if (event.target === dialog.value) open.value = false
}
</script>
<template>
  <dialog
    :id="id"
    ref="dialog"
    class="hc-dialog"
    :aria-labelledby="id + '-title'"
    @close="open = false"
    @click="backdrop"
  >
    <div class="hc-dialog-panel">
      <header>
        <h2 :id="id + '-title'">{{ title }}</h2>
        <HcButton
          variant="quiet"
          size="small"
          :aria-label="t('storefront', 'close')"
          @click="open = false"
          ><PhX :size="16" aria-hidden="true"
        /></HcButton>
      </header>
      <slot />
    </div>
  </dialog>
</template>
<style scoped>
/* A drawer sheet: title bar on top, paper body, slides in from the edge. */
.hc-dialog {
  height: 100dvh;
  max-height: 100dvh;
  width: min(88vw, 360px);
  max-width: 100vw;
  margin: 0;
  padding: 0;
  border: 0;
  border-right: 1px solid var(--border-strong);
  background: var(--surface-raised);
  color: var(--text-primary);
  box-shadow: var(--shadow-lift);
}
.hc-dialog[open] {
  animation: hc-drawer 220ms var(--ease);
}
.hc-dialog::backdrop {
  background: rgb(43 38 33 / 45%);
  animation: hc-fade 200ms ease;
}
header {
  position: sticky;
  top: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.5rem 0.75rem 0.5rem 1.1rem;
  border-bottom: 1px solid var(--border);
  background: var(--titlebar);
  text-shadow: var(--emboss);
}
h2 {
  margin: 0;
  font-family: var(--font-ui);
  font-size: 0.82rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.hc-dialog-panel > :not(header) {
  padding: 1.1rem;
}
@keyframes hc-drawer {
  from {
    transform: translateX(-24px);
    opacity: 0;
  }
  to {
    transform: none;
    opacity: 1;
  }
}
</style>
