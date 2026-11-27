<script setup lang="ts">
import { Head, Link } from '@inertiajs/vue3'
import StorefrontLayout from '~/app/layouts/StorefrontLayout.vue'
import HcPanel from '~/app/design/HcPanel.vue'
import AccountForm from '~/features/account/AccountForm.vue'
import HcNotice from '~/app/design/HcNotice.vue'
import { useI18n } from '~/app/shared/i18n'
defineProps<{ canRegister: boolean; firstRun?: boolean }>()
const { t } = useI18n()
</script>

<template>
  <Head :title="t('auth', 'login')"><meta name="robots" content="noindex" /></Head>
  <StorefrontLayout>
    <HcPanel class="account-panel">
      <h1>{{ t('auth', 'login') }}</h1>
      <HcNotice />
      <Link v-if="firstRun" class="hc-notice first-run-link" href="/welcome">{{
        t('auth', 'firstRun')
      }}</Link>
      <AccountForm mode="login" :can-register="canRegister" />
    </HcPanel>
  </StorefrontLayout>
</template>
