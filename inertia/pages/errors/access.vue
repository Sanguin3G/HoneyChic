<script setup lang="ts">
import { Head, Link } from '@inertiajs/vue3'
import StorefrontLayout from '~/app/layouts/StorefrontLayout.vue'
import HcPanel from '~/app/design/HcPanel.vue'
import { useI18n } from '~/app/shared/i18n'
const props = defineProps<{ status: 403 | 429 }>()
const { t } = useI18n()
const key = props.status === 403 ? 'forbidden' : 'throttled'
</script>

<template>
  <Head :title="t('errors', key + 'Title')"><meta name="robots" content="noindex" /></Head>
  <StorefrontLayout>
    <HcPanel class="account-panel">
      <h1>{{ t('errors', key + 'Title') }}</h1>
      <p>{{ t('errors', key + 'Description') }}</p>
      <Link href="/">{{ t('common', 'home') }}</Link>
    </HcPanel>
  </StorefrontLayout>
</template>
