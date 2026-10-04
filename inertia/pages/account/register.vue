<script setup lang="ts">
import { Head } from '@inertiajs/vue3'
import StorefrontLayout from '~/app/layouts/StorefrontLayout.vue'
import HcPanel from '~/app/design/HcPanel.vue'
import AccountForm from '~/features/account/AccountForm.vue'
import { useI18n } from '~/app/shared/i18n'
const { t } = useI18n()
</script>

<template>
  <Head :title="t('auth', 'register')"><meta name="robots" content="noindex" /></Head>
  <StorefrontLayout>
    <HcPanel class="account-panel">
      <h1>{{ t('auth', 'register') }}</h1>
      <AccountForm mode="register" />
    </HcPanel>
  </StorefrontLayout>
</template>
