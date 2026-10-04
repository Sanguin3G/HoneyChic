<script setup lang="ts">
import { Head } from '@inertiajs/vue3'
import AdminLayout from '~/app/layouts/AdminLayout.vue'
import HcPanel from '~/app/design/HcPanel.vue'
import StoreSettingsForm from '~/features/settings/StoreSettingsForm.vue'
import CapabilityPanel from '~/features/settings/CapabilityPanel.vue'
import { useI18n } from '~/app/shared/i18n'
import type { StoreSettings } from '~/features/settings/types'
defineProps<{ settings: StoreSettings }>()
const { t } = useI18n()
</script>

<template>
  <Head :title="t('settings', 'title')"><meta name="robots" content="noindex" /></Head>
  <AdminLayout>
    <HcPanel
      ><h1>{{ t('settings', 'title') }}</h1>
      <StoreSettingsForm :settings="settings"
    /></HcPanel>
    <CapabilityPanel />
  </AdminLayout>
</template>
