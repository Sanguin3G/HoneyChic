<script setup lang="ts">
import { Link } from '@inertiajs/vue3'
import HcInput from '~/app/design/HcInput.vue'
import HcButton from '~/app/design/HcButton.vue'
import { useI18n } from '~/app/shared/i18n'
import type { ProductFormData } from './types'
const form = defineModel<ProductFormData>('form', { required: true })
defineProps<{
  currency: string
  errors: Record<string, string | undefined>
}>()
const { t } = useI18n()
function addVariant() {
  form.value.variants.push({
    sku: '',
    price: '0',
    selections: form.value.options.map((option) => option.values[0] ?? ''),
  })
}
</script>
<template>
  <section class="catalog-section">
    <h2>{{ t('catalog', 'variants') }} · {{ currency }}</h2>
    <p>{{ t('catalog', 'currencyHelp') }}</p>
    <p v-if="errors.variants" class="hc-error" role="alert">{{ errors.variants }}</p>
    <fieldset v-for="(variant, i) in form.variants" :key="i" class="catalog-row">
      <legend>
        {{
          form.options.length
            ? t('catalog', 'variant') + ' ' + (i + 1)
            : t('catalog', 'defaultVariant')
        }}
      </legend>
      <Link v-if="variant.id" :href="'/admin/inventory/' + variant.id">{{
        t('inventory', 'title')
      }}</Link>
      <div class="catalog-grid">
        <HcInput
          :id="'sku-' + i"
          v-model="variant.sku"
          :label="t('catalog', 'sku')"
          :error="errors['variants.' + i + '.sku']"
          maxlength="80"
          required
        />
        <HcInput
          :id="'price-' + i"
          v-model="variant.price"
          :label="t('catalog', 'price') + ' (' + currency + ')'"
          :error="errors['variants.' + i + '.price']"
          inputmode="decimal"
          required
        />
        <div v-for="(option, j) in form.options" :key="j" class="hc-field">
          <label :for="'selection-' + i + '-' + j">{{
            option.name || t('catalog', 'optionName')
          }}</label>
          <select
            :id="'selection-' + i + '-' + j"
            v-model="variant.selections[j]"
            class="hc-input"
            required
          >
            <option disabled value="">{{ t('catalog', 'choose') }}</option>
            <option v-for="value in option.values" :key="value" :value="value">{{ value }}</option>
          </select>
        </div>
      </div>
      <p v-if="errors['variants.' + i + '.selections']" class="hc-error" role="alert">
        {{ errors['variants.' + i + '.selections'] }}
      </p>
      <HcButton
        variant="quiet"
        :disabled="form.variants.length === 1"
        @click="form.variants.splice(i, 1)"
        >{{ t('catalog', 'remove') }}</HcButton
      >
    </fieldset>
    <HcButton
      v-if="form.options.length"
      variant="quiet"
      :disabled="form.variants.length >= 100"
      @click="addVariant"
      >{{ t('catalog', 'addVariant') }}</HcButton
    >
  </section>
</template>
