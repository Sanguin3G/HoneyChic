<script setup lang="ts">
import { computed, h } from 'vue'
import { Head, usePage } from '@inertiajs/vue3'
import type { SharedProps } from './i18n'
const props = defineProps<{
  title: string
  description: string
  path: string
  image?: string
  product?: boolean
  filtered?: boolean
  structuredData?: Record<string, unknown>
}>()
const page = usePage<SharedProps>()
const canonical = computed(() => new URL(props.path, page.props.seo.origin).href)
const imageUrl = computed(() =>
  props.image ? new URL(props.image, page.props.seo.origin).href : null
)
const data = computed(() =>
  props.structuredData ? JSON.stringify(props.structuredData).replace(/</g, '\\u003c') : null
)
// Inertia Head accepts functional VNodes and renders their string children.
const StructuredData = () =>
  h('script', { 'type': 'application/ld+json', 'head-key': 'structured-data' }, data.value ?? '')
</script>
<template>
  <Head :title="title">
    <meta head-key="description" name="description" :content="description.slice(0, 160)" />
    <meta
      head-key="robots"
      name="robots"
      :content="page.props.seo.indexable && !filtered ? 'index,follow' : 'noindex,follow'"
    />
    <link head-key="canonical" rel="canonical" :href="canonical" />
    <meta head-key="og-type" property="og:type" :content="product ? 'product' : 'website'" />
    <meta head-key="og-title" property="og:title" :content="title" />
    <meta
      head-key="og-description"
      property="og:description"
      :content="description.slice(0, 160)"
    />
    <meta head-key="og-url" property="og:url" :content="canonical" />
    <meta head-key="og-site" property="og:site_name" :content="page.props.store.name" />
    <meta
      head-key="og-locale"
      property="og:locale"
      :content="page.props.locale === 'vi' ? 'vi_VN' : 'en_US'"
    />
    <meta v-if="imageUrl" head-key="og-image" property="og:image" :content="imageUrl" />
    <meta
      head-key="twitter-card"
      name="twitter:card"
      :content="imageUrl ? 'summary_large_image' : 'summary'"
    />
    <meta head-key="twitter-title" name="twitter:title" :content="title" />
    <meta
      head-key="twitter-description"
      name="twitter:description"
      :content="description.slice(0, 160)"
    />
    <meta v-if="imageUrl" head-key="twitter-image" name="twitter:image" :content="imageUrl" />
    <StructuredData v-if="data" />
  </Head>
</template>
