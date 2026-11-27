<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Link, usePage } from '@inertiajs/vue3'
import { PhStorefront, PhList, PhShoppingBagOpen, PhSquaresFour } from '@phosphor-icons/vue'
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
// Bump the cart badge when the quantity changes.
const bump = ref(false)
watch(
  () => page.props.cartQuantity,
  (next, previous) => {
    if (next === previous) return
    bump.value = false
    requestAnimationFrame(() => (bump.value = true))
  }
)
const year = new Date().getFullYear()
</script>
<template>
  <BrandHead />
  <a class="skip-link" href="#main">{{ t('navigation', 'skip') }}</a>
  <header class="store-header">
    <div class="store-nav">
      <Link class="store-brand" href="/">
        <img
          v-if="page.props.store.logoUrl"
          class="store-logo"
          :src="page.props.store.logoUrl"
          alt=""
          width="36"
          height="36"
        />
        <span v-else class="store-app-icon" aria-hidden="true"
          ><PhStorefront :size="22" weight="fill"
        /></span>
        <span class="store-brand-name">{{ page.props.store.name }}</span>
      </Link>
      <StoreSearch />
      <nav class="store-primary-links" :aria-label="t('navigation', 'main')">
        <Link
          class="store-tool"
          href="/products"
          :aria-current="page.url.startsWith('/products') ? 'page' : undefined"
          ><PhSquaresFour :size="22" aria-hidden="true" /><span>{{
            t('catalog', 'catalog')
          }}</span></Link
        >
        <Link
          href="/cart"
          class="store-tool store-cart-link"
          :aria-label="t('cart', 'title') + ' (' + page.props.cartQuantity + ')'"
          :aria-current="page.url === '/cart' ? 'page' : undefined"
        >
          <span class="store-tool-icon"
            ><PhShoppingBagOpen :size="22" aria-hidden="true" /><span
              class="hc-badge store-cart-count"
              :class="{ 'hc-pop': bump }"
              :data-count="page.props.cartQuantity"
              aria-hidden="true"
              @animationend="bump = false"
              >{{ page.props.cartQuantity }}</span
            ></span
          ><span class="store-cart-label">{{ t('cart', 'title') }}</span>
        </Link>
      </nav>
      <div class="store-desktop-links"><StoreLinks /></div>
      <details class="store-mobile-menu">
        <summary class="store-tool">
          <PhList :size="22" aria-hidden="true" /><span>{{ t('storefront', 'menu') }}</span>
        </summary>
        <StoreLinks />
      </details>
    </div>
  </header>
  <main id="main" class="store-main" tabindex="-1"><slot /></main>
  <footer class="store-footer">
    <div class="store-footer-inner">
      <section class="store-footer-about">
        <strong class="store-footer-name">{{ page.props.store.name }}</strong>
        <p v-if="page.props.store.description" class="store-footer-copy">
          {{ page.props.store.description }}
        </p>
        <Link class="hc-link" href="/products">{{ t('storefront', 'browse') }}</Link>
      </section>
      <section
        v-if="page.props.store.email || page.props.store.phone || page.props.store.address"
        class="store-footer-contact"
      >
        <h2>{{ t('storefront', 'contact') }}</h2>
        <a v-if="page.props.store.email" :href="'mailto:' + page.props.store.email">{{
          page.props.store.email
        }}</a>
        <a v-if="page.props.store.phone" :href="'tel:' + page.props.store.phone">{{
          page.props.store.phone
        }}</a>
        <span v-if="page.props.store.address">{{ page.props.store.address }}</span>
      </section>
      <section v-if="socials.length" class="store-footer-social">
        <h2>{{ t('storefront', 'follow') }}</h2>
        <a
          v-for="link in socials"
          :key="link.key"
          :href="link.href"
          rel="noopener noreferrer"
          target="_blank"
          >{{ link.label }}</a
        >
      </section>
    </div>
    <p class="store-footer-bar">
      <span>© {{ year }} {{ page.props.store.name }}</span>
      <span>{{ t('common', 'poweredBy') }} <strong>HoneyChic</strong></span>
    </p>
  </footer>
</template>
