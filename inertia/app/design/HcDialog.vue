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
        <HcButton variant="quiet" :aria-label="t('storefront', 'close')" @click="open = false"
          ><PhX :size="20" aria-hidden="true"
        /></HcButton>
      </header>
      <slot />
    </div>
  </dialog>
</template>
<style scoped>
.hc-dialog {
  padding: 0;
  margin: 0;
  height: 100dvh;
  max-height: 100dvh;
  width: min(90vw, 360px);
  max-width: 100vw;
  border: 0;
  border-right: 2px solid var(--border-strong);
  color: var(--text-primary);
  background: var(--surface-raised);
  box-shadow: var(--elevation-panel);
}
.hc-dialog::backdrop {
  background: rgb(23 45 72 / 55%);
}
.hc-dialog-panel {
  padding: 1.25rem;
}
header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}
h2 {
  margin: 0;
  font-size: 1.25rem;
}
</style>
