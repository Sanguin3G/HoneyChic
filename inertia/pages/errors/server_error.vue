<script setup lang="ts">
import { Head, Link } from '@inertiajs/vue3'
import HcPanel from '~/app/design/HcPanel.vue'
import StorefrontLayout from '~/app/layouts/StorefrontLayout.vue'
import { useI18n } from '~/app/shared/i18n'
const { t } = useI18n()
</script>

<template>
  <Head :title="t('errors', 'serverError')" />
  <StorefrontLayout>
    <HcPanel class="error-panel">
      <h1>{{ t('errors', 'serverError') }}</h1>
      <p>{{ t('errors', 'serverErrorBody') }}</p>
      <Link class="hc-button hc-button--primary" href="/">{{ t('navigation', 'home') }}</Link>
    </HcPanel>
  </StorefrontLayout>
</template>

<style scoped>
.error-panel {
  max-width: 36rem;
}
.error-panel h1 {
  margin-top: 0;
}
.error-panel .hc-button {
  margin-top: 1rem;
}
</style>
