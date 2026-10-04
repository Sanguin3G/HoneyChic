<script setup lang="ts">
import { Head } from '@inertiajs/vue3'
import { useI18n } from '~/app/shared/i18n'
import StorefrontLayout from '~/app/layouts/StorefrontLayout.vue'
const { t } = useI18n()
</script>

<template>
  <Head :title="t('errors', 'serverError')" />
  <StorefrontLayout>
    <h1>{{ t('errors', 'serverError') }}</h1>
    <p>{{ t('errors', 'serverErrorBody') }}</p>
    <a href="/">{{ t('navigation', 'home') }}</a>
  </StorefrontLayout>
</template>
