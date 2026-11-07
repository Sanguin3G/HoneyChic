<script setup lang="ts">
import { Link } from '@inertiajs/vue3'
import { useI18n } from '~/app/shared/i18n'
defineProps<{ categories: { name: string; slug: string }[] }>()
const { t, locale } = useI18n()

function mark(name: string) {
  return Array.from(name.trim())[0]?.toLocaleUpperCase(locale.value) ?? '•'
}
</script>
<template>
  <section v-if="categories.length" class="shop-categories">
    <div class="section-heading">
      <h2>{{ t('storefront', 'categories') }}</h2>
      <p>{{ t('storefront', 'categoryIntro') }}</p>
    </div>
    <div class="category-links">
      <Link
        v-for="category in categories"
        :key="category.slug"
        :href="'/products?category=' + category.slug"
      >
        <span class="category-mark" aria-hidden="true">{{ mark(category.name) }}</span>
        <strong>{{ category.name }}</strong>
      </Link>
    </div>
  </section>
</template>
