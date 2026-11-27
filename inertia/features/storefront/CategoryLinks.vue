<script setup lang="ts">
import { Link } from '@inertiajs/vue3'
import { PhCaretRight, PhSquaresFour } from '@phosphor-icons/vue'
import { useI18n } from '~/app/shared/i18n'
defineProps<{
  categories: { name: string; slug: string; image: { url: string; altText: string } | null }[]
}>()
const { t } = useI18n()
</script>
<template>
  <section v-if="categories.length" id="categories" class="shop-categories">
    <div class="section-heading">
      <div>
        <p class="eyebrow">{{ t('storefront', 'browseBy') }}</p>
        <h2>{{ t('storefront', 'categories') }}</h2>
      </div>
      <p>{{ t('storefront', 'categoryIntro') }}</p>
    </div>
    <ul class="category-links">
      <li v-for="category in categories" :key="category.slug">
        <Link :href="'/products?category=' + category.slug">
          <span class="category-thumb">
            <img
              v-if="category.image"
              :src="category.image.url"
              alt=""
              width="96"
              height="96"
              loading="lazy"
            />
            <PhSquaresFour v-else :size="26" aria-hidden="true" />
          </span>
          <strong>{{ category.name }}</strong>
          <PhCaretRight class="category-caret" :size="16" aria-hidden="true" />
        </Link>
      </li>
    </ul>
  </section>
</template>
