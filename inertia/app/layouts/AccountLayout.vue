<script setup lang="ts">
import { Link, usePage } from '@inertiajs/vue3'
import StorefrontLayout from './StorefrontLayout.vue'
import { useI18n, type SharedProps } from '~/app/shared/i18n'
const page = usePage<SharedProps>()
const { t } = useI18n()
</script>
<template>
  <StorefrontLayout
    ><div class="account-grid">
      <nav class="account-nav" :aria-label="t('account', 'navigation')">
        <Link href="/account" :aria-current="page.url === '/account' ? 'page' : undefined">{{
          t('orders', 'profile')
        }}</Link>
        <Link
          href="/account/orders"
          :aria-current="page.url.startsWith('/account/orders') ? 'page' : undefined"
          >{{ t('orders', 'history') }}</Link
        >
        <Link
          href="/account/addresses"
          :aria-current="page.url.startsWith('/account/addresses') ? 'page' : undefined"
          >{{ t('orders', 'addresses') }}</Link
        >
        <Link v-if="page.props.capabilities.wishlist.available" href="/account/wishlist">{{
          t('modules', 'wishlist')
        }}</Link>
        <Link v-if="page.props.permissions.admin" href="/admin">{{
          t('navigation', 'admin')
        }}</Link>
      </nav>
      <section class="account-content"><slot /></section></div
  ></StorefrontLayout>
</template>
