<script setup lang="ts">
import { computed, ref } from 'vue'
import { Link, router, usePage } from '@inertiajs/vue3'
import {
  PhArrowSquareOut,
  PhGear,
  PhHouse,
  PhList,
  PhPackage,
  PhPuzzlePiece,
  PhReceipt,
  PhSignOut,
  PhSquaresFour,
  PhStorefront,
  PhUserCircle,
  PhUsers,
  PhWarehouse,
} from '@phosphor-icons/vue'
import LocaleSwitcher from '~/app/navigation/LocaleSwitcher.vue'
import HcButton from '~/app/design/HcButton.vue'
import BrandHead from '~/app/shared/BrandHead.vue'
import { useI18n, type SharedProps } from '~/app/shared/i18n'
const navOpen = ref(false)
const page = usePage<SharedProps>()
const { t } = useI18n()
type NavLink = { href: string; label: string; icon: unknown; exact?: boolean }
const sections = computed<{ label: string | null; links: NavLink[] }[]>(() => [
  {
    label: null,
    links: [{ href: '/admin', label: t('settings', 'overview'), icon: PhHouse, exact: true }],
  },
  {
    label: t('admin', 'navSales'),
    links: [
      { href: '/admin/orders', label: t('admin', 'orders'), icon: PhReceipt },
      { href: '/admin/customers', label: t('admin', 'customers'), icon: PhUsers },
    ],
  },
  {
    label: t('admin', 'navCatalog'),
    links: [
      { href: '/admin/products', label: t('catalog', 'products'), icon: PhPackage },
      { href: '/admin/categories', label: t('catalog', 'categories'), icon: PhSquaresFour },
      { href: '/admin/inventory', label: t('inventory', 'title'), icon: PhWarehouse },
    ],
  },
  {
    label: t('admin', 'navStore'),
    links: [
      { href: '/admin/modules', label: t('admin', 'modules'), icon: PhPuzzlePiece },
      ...(page.props.permissions.manageStore
        ? [{ href: '/admin/settings', label: t('settings', 'title'), icon: PhGear }]
        : []),
    ],
  },
])
function current(href: string, exact?: boolean) {
  const path = page.url.split('?')[0]
  if (exact) return path === href
  if (href === '/admin/settings') return path === href || path.startsWith('/admin/setup')
  return path === href || path.startsWith(href + '/')
}
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
      <div class="admin-sidebar-head">
        <Link class="admin-brand" href="/admin">
          <img
            v-if="page.props.store.logoUrl"
            class="store-logo"
            :src="page.props.store.logoUrl"
            alt=""
            width="32"
            height="32"
          />
          <span v-else class="store-app-icon" aria-hidden="true"
            ><PhStorefront :size="20" weight="fill"
          /></span>
          <span>
            <strong>{{ page.props.store.name }}</strong>
            <small>HoneyChic</small>
          </span>
        </Link>
        <HcButton
          class="admin-nav-toggle"
          variant="quiet"
          size="small"
          :aria-expanded="navOpen"
          aria-controls="admin-navigation"
          :aria-label="t('admin', navOpen ? 'closeMenu' : 'menu')"
          @click="navOpen = !navOpen"
          ><PhList :size="18" aria-hidden="true" />{{ t('storefront', 'menu') }}</HcButton
        >
      </div>
      <nav id="admin-navigation" :aria-label="t('navigation', 'admin')" @click="navOpen = false">
        <template v-for="(section, index) in sections" :key="index">
          <p v-if="section.label" class="admin-nav-heading">{{ section.label }}</p>
          <Link
            v-for="link in section.links"
            :key="link.href"
            :href="link.href"
            :aria-current="current(link.href, link.exact) ? 'page' : undefined"
          >
            <component :is="link.icon as object" :size="18" aria-hidden="true" />{{ link.label }}
          </Link>
        </template>
        <p class="admin-nav-heading">{{ t('admin', 'navYou') }}</p>
        <Link href="/account">
          <PhUserCircle :size="18" aria-hidden="true" />{{ t('navigation', 'account') }}
        </Link>
      </nav>
    </aside>
    <div class="admin-workspace">
      <header class="admin-toolbar">
        <Link class="hc-button hc-button--small" href="/"
          ><PhArrowSquareOut :size="16" aria-hidden="true" />{{
            t('navigation', 'storefront')
          }}</Link
        >
        <span class="admin-toolbar-spacer"></span>
        <span class="admin-user"
          ><PhUserCircle :size="18" aria-hidden="true" />{{ page.props.auth?.fullName }}</span
        >
        <LocaleSwitcher />
        <HcButton variant="quiet" size="small" @click="router.post('/logout')"
          ><PhSignOut :size="16" aria-hidden="true" />{{ t('auth', 'logout') }}</HcButton
        >
      </header>
      <main id="main" tabindex="-1"><slot /></main>
    </div>
  </div>
</template>
