<script setup lang="ts">
import HcInput from '~/app/design/HcInput.vue'
import HcButton from '~/app/design/HcButton.vue'
import { useI18n } from '~/app/shared/i18n'
import type { ProductFormData } from './types'
const form = defineModel<ProductFormData>('form', { required: true })
defineProps<{
  errors: Record<string, string | undefined>
}>()
const { t } = useI18n()
function removeOption(index: number) {
  form.value.options.splice(index, 1)
  form.value.variants.forEach((variant) => variant.selections.splice(index, 1))
  if (!form.value.options.length) form.value.variants.splice(1)
}
function addOption() {
  form.value.options.push({ name: '', values: [''] })
  form.value.variants.forEach((variant) => variant.selections.push(''))
}
</script>
<template>
  <section class="catalog-section">
    <h2>{{ t('catalog', 'options') }}</h2>
    <p>{{ t('catalog', 'optionHelp') }}</p>
    <p v-if="errors.options" class="hc-error" role="alert">{{ errors.options }}</p>
    <fieldset v-for="(option, i) in form.options" :key="i" class="catalog-row">
      <legend>{{ t('catalog', 'optionName') }} {{ i + 1 }}</legend>
      <HcInput
        :id="'option-' + i"
        v-model="option.name"
        :label="t('catalog', 'optionName')"
        :error="errors['options.' + i + '.name']"
        maxlength="80"
        required
      />
      <div class="catalog-grid">
        <div v-for="(_, j) in option.values" :key="j">
          <HcInput
            :id="'value-' + i + '-' + j"
            v-model="option.values[j]"
            :label="t('catalog', 'values') + ' ' + (j + 1)"
            :error="errors['options.' + i + '.values.' + j]"
            maxlength="80"
            required
          />
          <HcButton
            variant="quiet"
            :disabled="option.values.length === 1"
            @click="option.values.splice(j, 1)"
            >{{ t('catalog', 'remove') }}</HcButton
          >
        </div>
      </div>
      <div class="form-actions">
        <HcButton
          variant="quiet"
          :disabled="option.values.length >= 30"
          @click="option.values.push('')"
          >{{ t('catalog', 'addValue') }}</HcButton
        >
        <HcButton variant="quiet" @click="removeOption(i)">{{ t('catalog', 'remove') }}</HcButton>
      </div>
    </fieldset>
    <HcButton variant="quiet" :disabled="form.options.length >= 3" @click="addOption">{{
      t('catalog', 'addOption')
    }}</HcButton>
  </section>
</template>
