<script setup lang="ts">
import { Link } from '@inertiajs/vue3'
import { PhArrowUpRight, PhSquaresFour } from '@phosphor-icons/vue'
import { useI18n } from '~/app/shared/i18n'
defineProps<{ categories: { name: string; slug: string }[] }>()
const { t } = useI18n()
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
        ><PhSquaresFour :size="24" weight="duotone" aria-hidden="true" /><strong>{{
          category.name
        }}</strong
        ><PhArrowUpRight :size="20" aria-hidden="true"
      /></Link>
    </div>
  </section>
</template>
