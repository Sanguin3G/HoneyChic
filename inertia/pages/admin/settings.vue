<script setup lang="ts">
import { Head, Link } from '@inertiajs/vue3'
import { PhFlag } from '@phosphor-icons/vue'
import AdminLayout from '~/app/layouts/AdminLayout.vue'
import HcPanel from '~/app/design/HcPanel.vue'
import StoreSettingsForm from '~/features/settings/StoreSettingsForm.vue'
import { useI18n } from '~/app/shared/i18n'
import type { StoreSettings } from '~/features/settings/types'
defineProps<{ settings: StoreSettings }>()
const { t } = useI18n()
</script>

<template>
  <Head :title="t('settings', 'title')"><meta name="robots" content="noindex" /></Head>
  <AdminLayout>
    <div class="admin-page-head">
      <h1>{{ t('settings', 'title') }}</h1>
      <Link class="hc-button" href="/admin/setup" :title="t('admin', 'setupLinkHelp')"
        ><PhFlag :size="16" aria-hidden="true" />{{ t('admin', 'setupLink') }}</Link
      >
    </div>
    <HcPanel><StoreSettingsForm :settings="settings" /></HcPanel>
  </AdminLayout>
</template>
