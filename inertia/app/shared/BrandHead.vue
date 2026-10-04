<script setup lang="ts">
import { computed, defineComponent, h } from 'vue'
import { Head, usePage } from '@inertiajs/vue3'
import type { SharedProps } from '~/app/shared/i18n'

const page = usePage<SharedProps>()
const faviconUrl = computed(() => page.props.store.faviconUrl || '')
const brandCss = computed(() => {
  const lines: string[] = []
  const primary = page.props.store.primaryColor
  const accent = page.props.store.accentColor
  if (primary && /^#[0-9a-fA-F]{6}$/.test(primary)) lines.push(`--brand-primary: ${primary}`)
  if (accent && /^#[0-9a-fA-F]{6}$/.test(accent)) lines.push(`--brand-accent: ${accent}`)
  return lines.length ? `:root { ${lines.join('; ')}; }` : ''
})

// A style tag written in a template is dropped by the Vue compiler.
const BrandStyle = defineComponent({
  props: { css: { type: String, required: true } },
  setup(props) {
    return () => (props.css ? h('style', { 'data-brand': 'store' }, props.css) : null)
  },
})
</script>

<template>
  <Head>
    <link v-if="faviconUrl" rel="icon" :href="faviconUrl" head-key="favicon" />
    <link v-else rel="icon" type="image/svg+xml" href="/favicon.svg" head-key="favicon" />
  </Head>
  <BrandStyle :css="brandCss" />
</template>
