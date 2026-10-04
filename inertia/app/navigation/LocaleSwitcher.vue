<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { router, usePage } from '@inertiajs/vue3'
import { PhCaretDown, PhCheck, PhGlobe } from '@phosphor-icons/vue'
import { useI18n, type Locale } from '~/app/shared/i18n'

const locales: Locale[] = ['en', 'vi']
const { locale, t } = useI18n()
const page = usePage()
const root = ref<HTMLElement>()
const trigger = ref<HTMLButtonElement>()
const open = ref(false)

function options() {
  return Array.from(root.value?.querySelectorAll<HTMLButtonElement>('[role="menuitemradio"]') ?? [])
}
function close() {
  open.value = false
}
function escape() {
  close()
  trigger.value?.focus()
}
async function toggle() {
  open.value = !open.value
  if (!open.value) return
  await nextTick()
  const current = options().find((option) => option.getAttribute('aria-checked') === 'true')
  ;(current ?? options()[0])?.focus()
}
function move(delta: number) {
  const items = options()
  const index = items.findIndex((item) => item === document.activeElement)
  items[(index + delta + items.length) % items.length]?.focus()
}
function select(value: Locale) {
  close()
  if (value === locale.value) {
    trigger.value?.focus()
    return
  }
  router.post('/locale', { locale: value, destination: page.url }, { preserveScroll: true })
}
function onPointerDown(event: PointerEvent) {
  if (!root.value?.contains(event.target as Node)) close()
}
onMounted(() => document.addEventListener('pointerdown', onPointerDown))
onBeforeUnmount(() => document.removeEventListener('pointerdown', onPointerDown))
</script>

<template>
  <div ref="root" class="language-menu" @keydown.esc.prevent="escape">
    <button
      ref="trigger"
      type="button"
      class="hc-button hc-button--quiet"
      :aria-label="t('navigation', 'language')"
      aria-haspopup="menu"
      aria-controls="language-menu"
      :aria-expanded="open"
      @click="toggle"
    >
      <PhGlobe :size="20" aria-hidden="true" />
      <PhCaretDown :size="12" aria-hidden="true" />
    </button>
    <div
      v-if="open"
      id="language-menu"
      class="language-menu__choices"
      role="menu"
      :aria-label="t('navigation', 'language')"
      @keydown.down.prevent="move(1)"
      @keydown.up.prevent="move(-1)"
    >
      <button
        v-for="value in locales"
        :key="value"
        type="button"
        role="menuitemradio"
        :lang="value"
        :aria-checked="locale === value"
        @click="select(value)"
      >
        <span>{{ t('navigation', value) }}</span>
        <PhCheck v-if="locale === value" :size="16" aria-hidden="true" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.language-menu {
  position: relative;
}
.language-menu > button {
  gap: 0.35rem;
  min-width: 44px;
  padding-inline: 0.65rem;
}
.language-menu__choices {
  position: absolute;
  inset-inline-end: 0;
  top: calc(100% + 0.35rem);
  z-index: 40;
  min-width: 11rem;
  padding: 0.3rem;
  border: 1px solid var(--border-strong);
  border-radius: 8px;
  background: var(--surface-raised);
  box-shadow: 0 5px 16px #10244030;
}
.language-menu__choices button {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  width: 100%;
  min-height: 44px;
  padding: 0.5rem 0.7rem;
  border-radius: 6px;
  color: var(--text-primary);
  cursor: pointer;
}
.language-menu__choices button:hover,
.language-menu__choices button[aria-checked='true'] {
  background: var(--surface-inset);
}
.language-menu__choices button:focus-visible {
  outline: 2px solid var(--focus);
  outline-offset: -2px;
}
</style>

<style>
@media (max-width: 800px) {
  .store-mobile-menu .language-menu .language-menu__choices {
    position: static;
    inset: auto;
    min-width: 0;
    margin-top: 0.35rem;
  }
}
</style>
