<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '~/app/shared/i18n'
import type { ProductDetail } from './types'
const props = defineProps<{
  options: ProductDetail['options']
  variants: ProductDetail['variants']
}>()
const selectedId = defineModel<number>({ required: true })
const selected = computed(() => props.variants.find((variant) => variant.id === selectedId.value))
const { t } = useI18n()
function choose(index: number, value: string) {
  const exact = props.variants.find(
    (variant) =>
      variant.selections[index] === value &&
      variant.selections.every(
        (choice, position) => position === index || choice === selected.value?.selections[position]
      )
  )
  const next =
    exact ??
    props.variants.find((variant) => variant.selections[index] === value && variant.available) ??
    props.variants.find((variant) => variant.selections[index] === value)
  if (next) selectedId.value = next.id
}
function offered(index: number, value: string) {
  return props.variants.some((variant) => variant.selections[index] === value)
}
</script>
<template>
  <fieldset v-if="options.length" class="product-options">
    <legend>{{ t('storefront', 'chooseOptions') }}</legend>
    <div v-for="(option, index) in options" :key="index" class="hc-field">
      <label :for="'product-option-' + index">{{ option.name }}</label>
      <select
        :id="'product-option-' + index"
        :value="selected?.selections[index]"
        class="hc-input"
        @change="choose(index, ($event.target as HTMLSelectElement).value)"
      >
        <option
          v-for="value in option.values"
          :key="value"
          :value="value"
          :disabled="!offered(index, value)"
        >
          {{ value }}
        </option>
      </select>
    </div>
  </fieldset>
</template>
