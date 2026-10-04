<script setup lang="ts">
import HcInput from '~/app/design/HcInput.vue'
import HcButton from '~/app/design/HcButton.vue'
import { useI18n } from '~/app/shared/i18n'
defineProps<{ prefix: string; categories: { name: string; slug: string }[] }>()
const filters = defineModel<{ q: string; category: string; inStock: string }>('filters', {
  required: true,
})
defineEmits<{ apply: []; reset: [] }>()
const { t } = useI18n()
</script>
<template>
  <form class="catalog-filter-form" @submit.prevent="$emit('apply')">
    <HcInput
      :id="prefix + '-search'"
      v-model="filters.q"
      :label="t('catalog', 'search')"
      type="search"
      maxlength="200"
    />
    <fieldset class="category-filter">
      <legend>{{ t('catalog', 'category') }}</legend>
      <label :class="{ selected: !filters.category }"
        ><input
          v-model="filters.category"
          type="radio"
          :name="prefix + '-category'"
          value=""
        /><span>{{ t('catalog', 'allCategories') }}</span></label
      >
      <label
        v-for="category in categories"
        :key="category.slug"
        :class="{ selected: filters.category === category.slug }"
        ><input
          v-model="filters.category"
          type="radio"
          :name="prefix + '-category'"
          :value="category.slug"
        /><span>{{ category.name }}</span></label
      >
    </fieldset>
    <label class="availability-filter"
      ><input
        type="checkbox"
        :checked="filters.inStock === '1'"
        @change="filters.inStock = ($event.target as HTMLInputElement).checked ? '1' : ''"
      /><span>{{ t('storefront', 'availableOnly') }}</span></label
    >
    <HcButton type="submit">{{ t('storefront', 'apply') }}</HcButton>
    <HcButton variant="quiet" @click="$emit('reset')">{{ t('storefront', 'reset') }}</HcButton>
  </form>
</template>
