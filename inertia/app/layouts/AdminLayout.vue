<script setup lang="ts">
import { ref } from 'vue'
import { Link, router, usePage } from '@inertiajs/vue3'
import { PhStorefront, PhGear, PhHouse } from '@phosphor-icons/vue'
import LocaleSwitcher from '~/app/navigation/LocaleSwitcher.vue'
import HcButton from '~/app/design/HcButton.vue'
import BrandHead from '~/app/shared/BrandHead.vue'
import { useI18n, type SharedProps } from '~/app/shared/i18n'
const navOpen = ref(false)
const page = usePage<SharedProps>()
const { t } = useI18n()
</script>

<template>
  <BrandHead />
  <a class="skip-link" href="#main">{{ t('navigation', 'skip') }}</a>
  <div class="admin-shell">
    <aside
      class="admin-sidebar"
      :class="{ 'admin-nav-open': navOpen }"
      @keydown.esc="navOpen = false"
    >
      <Link class="admin-brand" href="/admin"
        ><PhStorefront :size="24" aria-hidden="true" /> <strong>HoneyChic</strong></Link
      >
      <p>{{ page.props.store.name }}</p>
      <HcButton
        class="admin-nav-toggle"
        variant="quiet"
        :aria-expanded="navOpen"
        aria-controls="admin-navigation"
        @click="navOpen = !navOpen"
        >{{ t('admin', navOpen ? 'closeMenu' : 'menu') }}</HcButton
      >
      <nav id="admin-navigation" :aria-label="t('navigation', 'admin')" @click="navOpen = false">
        <Link href="/admin" :aria-current="page.url === '/admin' ? 'page' : undefined">
          <PhHouse :size="20" aria-hidden="true" />{{ t('settings', 'overview') }}
        </Link>
        <Link
          v-if="page.props.permissions.manageStore"
          href="/admin/settings"
          :aria-current="page.url === '/admin/settings' ? 'page' : undefined"
        >
          <PhGear :size="20" aria-hidden="true" />{{ t('settings', 'title') }}
        </Link>
        <Link
          href="/admin/products"
          :aria-current="page.url.startsWith('/admin/products') ? 'page' : undefined"
          >{{ t('catalog', 'products') }}</Link
        >
        <Link
          href="/admin/inventory"
          :aria-current="page.url.startsWith('/admin/inventory') ? 'page' : undefined"
          >{{ t('inventory', 'title') }}</Link
        >
        <Link
          href="/admin/orders"
          :aria-current="page.url.startsWith('/admin/orders') ? 'page' : undefined"
          >{{ t('admin', 'orders') }}</Link
        >
        <Link
          href="/admin/customers"
          :aria-current="page.url.startsWith('/admin/customers') ? 'page' : undefined"
          >{{ t('admin', 'customers') }}</Link
        >
        <Link
          href="/admin/modules"
          :aria-current="page.url.startsWith('/admin/modules') ? 'page' : undefined"
          >{{ t('admin', 'modules') }}</Link
        >
        <Link
          href="/admin/categories"
          :aria-current="page.url.startsWith('/admin/categories') ? 'page' : undefined"
          >{{ t('catalog', 'categories') }}</Link
        >
        <Link href="/">{{ t('navigation', 'storefront') }}</Link>
        <Link href="/account">{{ t('navigation', 'account') }}</Link>
      </nav>
    </aside>
    <div class="admin-workspace">
      <header class="admin-toolbar">
        <span>{{ page.props.auth?.fullName }}</span>
        <LocaleSwitcher />
        <HcButton variant="quiet" @click="router.post('/logout')">{{
          t('auth', 'logout')
        }}</HcButton>
      </header>
      <main id="main" tabindex="-1"><slot /></main>
    </div>
  </div>
</template>
