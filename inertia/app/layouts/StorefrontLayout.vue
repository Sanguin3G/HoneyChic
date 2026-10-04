<script setup lang="ts">
import { computed } from 'vue'
import { Link, usePage } from '@inertiajs/vue3'
import { PhStorefront, PhList, PhShoppingCart } from '@phosphor-icons/vue'
import StoreLinks from '~/app/navigation/StoreLinks.vue'
import StoreSearch from '~/app/navigation/StoreSearch.vue'
import BrandHead from '~/app/shared/BrandHead.vue'
import { useI18n, type SharedProps } from '~/app/shared/i18n'
const page = usePage<SharedProps>()
const { t } = useI18n()
const socials = computed(() => {
  const store = page.props.store
  const links = [
    ['website', store.website],
    ['facebook', store.facebook],
    ['instagram', store.instagram],
    ['youtube', store.youtube],
    ['tiktok', store.tiktok],
  ] as const
  return links.flatMap(([key, href]) =>
    href && href.startsWith('https://') ? [{ key, href, label: t('storefront', key) }] : []
  )
})
</script>
<template>
  <BrandHead />
  <a class="skip-link" href="#main">{{ t('navigation', 'skip') }}</a>
  <header class="store-header">
    <div class="store-nav">
      <Link class="store-brand" href="/"
        ><img
          v-if="page.props.store.logoUrl"
          class="store-logo"
          :src="page.props.store.logoUrl"
          alt=""
          width="32"
          height="32"
        /><PhStorefront v-else :size="32" weight="duotone" aria-hidden="true" /><span>{{
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
    <div v-if="page.props.store.description" class="store-footer-copy">
      <p>{{ page.props.store.description }}</p>
    </div>
    <div
      v-if="page.props.store.email || page.props.store.phone || page.props.store.address"
      class="store-footer-contact"
    >
      <a v-if="page.props.store.email" :href="'mailto:' + page.props.store.email">{{
        page.props.store.email
      }}</a>
      <a v-if="page.props.store.phone" :href="'tel:' + page.props.store.phone">{{
        page.props.store.phone
      }}</a>
      <span v-if="page.props.store.address">{{ page.props.store.address }}</span>
    </div>
    <div v-if="socials.length" class="store-footer-social">
      <a
        v-for="link in socials"
        :key="link.key"
        :href="link.href"
        rel="noopener noreferrer"
        target="_blank"
        >{{ link.label }}</a
      >
    </div>
    <p>{{ t('common', 'poweredBy') }} <strong>HoneyChic</strong></p>
  </footer>
</template>
