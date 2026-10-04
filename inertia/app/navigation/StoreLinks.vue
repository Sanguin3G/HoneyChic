<script setup lang="ts">
import { Link, router, usePage } from '@inertiajs/vue3'
import { PhUserCircle, PhSignOut, PhGear } from '@phosphor-icons/vue'
import HcButton from '~/app/design/HcButton.vue'
import LocaleSwitcher from './LocaleSwitcher.vue'
import { useI18n, type SharedProps } from '~/app/shared/i18n'
const page = usePage<SharedProps>()
const { t } = useI18n()
</script>
<template>
  <div class="store-nav-actions">
    <Link v-if="page.props.auth" href="/account"
      ><PhUserCircle :size="20" aria-hidden="true" />{{ t('navigation', 'account') }}</Link
    >
    <Link v-else-if="page.props.capabilities.customer_accounts?.available" href="/login"
      ><PhUserCircle :size="20" aria-hidden="true" />{{ t('auth', 'login') }}</Link
    >
    <Link v-if="page.props.permissions.admin" href="/admin"
      ><PhGear :size="20" aria-hidden="true" />{{ t('navigation', 'admin') }}</Link
    >
    <LocaleSwitcher />
    <HcButton
      v-if="page.props.auth"
      variant="quiet"
      :aria-label="t('auth', 'logout')"
      @click="router.post('/logout')"
      ><PhSignOut :size="20" aria-hidden="true"
    /></HcButton>
  </div>
</template>
