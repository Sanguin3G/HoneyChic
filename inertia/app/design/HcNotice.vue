<script setup lang="ts">
import { usePage } from '@inertiajs/vue3'
import { useI18n, type SharedProps } from '~/app/shared/i18n'
const page = usePage<SharedProps>()
const { message } = useI18n()
</script>

<template>
  <p v-if="page.props.notice" class="hc-notice" role="status">{{ message(page.props.notice) }}</p>
</template>
