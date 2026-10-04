<script setup lang="ts">
import { Link, usePage } from '@inertiajs/vue3'
import { PhStorefront, PhList, PhShoppingCart } from '@phosphor-icons/vue'
import StoreLinks from '~/app/navigation/StoreLinks.vue'
import StoreSearch from '~/app/navigation/StoreSearch.vue'
import { useI18n, type SharedProps } from '~/app/shared/i18n'
const page = usePage<SharedProps>()
const { t } = useI18n()
</script>
<template>
  <a class="skip-link" href="#main">{{ t('navigation', 'skip') }}</a>
  <header class="store-header">
    <div class="store-nav">
      <Link class="store-brand" href="/"
        ><PhStorefront :size="32" weight="duotone" aria-hidden="true" /><span>{{
          page.props.store.name
        }}</span></Link
      >
      <nav class="store-primary-links" :aria-label="t('navigation', 'main')">
        <Link
          href="/products"
          :aria-current="page.url.startsWith('/products') ? 'page' : undefined"
          >{{ t('catalog', 'catalog') }}</Link
        >
        <Link
          href="/cart"
          class="store-cart-link"
          :aria-label="t('cart', 'title') + ' (' + page.props.cartQuantity + ')'"
          :aria-current="page.url === '/cart' ? 'page' : undefined"
        >
          <PhShoppingCart :size="22" aria-hidden="true" /><span class="store-cart-label">{{
            t('cart', 'title')
          }}</span>
          <span class="store-cart-count" aria-hidden="true">{{ page.props.cartQuantity }}</span>
        </Link>
      </nav>
      <div class="store-desktop-links"><StoreLinks /></div>
      <details class="store-mobile-menu">
        <summary>
          <PhList :size="22" aria-hidden="true" /><span>{{ t('storefront', 'menu') }}</span>
        </summary>
        <StoreLinks />
      </details>
      <StoreSearch />
    </div>
  </header>
  <main id="main" class="store-main" tabindex="-1"><slot /></main>
  <footer class="store-footer">
    <div>
      <strong>{{ page.props.store.name }}</strong
      ><Link href="/products">{{ t('storefront', 'browse') }}</Link>
    </div>
    <p>{{ t('common', 'poweredBy') }} <strong>HoneyChic</strong></p>
  </footer>
</template>
