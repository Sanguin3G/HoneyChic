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
function primary(index: number) {
  form.value.images.forEach((image, i) => (image.isPrimary = i === index))
}
function remove(index: number) {
  const wasPrimary = form.value.images[index].isPrimary
  form.value.images.splice(index, 1)
  if (wasPrimary) primary(0)
}
function move(index: number, offset: number) {
  const [image] = form.value.images.splice(index, 1)
  form.value.images.splice(index + offset, 0, image)
}
</script>
<template>
  <section class="catalog-section">
    <h2>{{ t('catalog', 'images') }}</h2>
    <p>{{ t('catalog', 'imageHelp') }}</p>
    <p v-if="errors.images" class="hc-error" role="alert">{{ errors.images }}</p>
    <fieldset v-for="(image, i) in form.images" :key="i" class="catalog-row">
      <legend>{{ t('catalog', 'images') }} {{ i + 1 }}</legend>
      <div class="catalog-grid">
        <HcInput
          :id="'image-key-' + i"
          v-model="image.storageKey"
          :label="t('catalog', 'storageKey')"
          :error="errors['images.' + i + '.storageKey']"
          required
        />
        <HcInput
          :id="'image-alt-' + i"
          v-model="image.altText"
          :label="t('catalog', 'altText')"
          :error="errors['images.' + i + '.altText']"
          required
        />
      </div>
      <label
        ><input type="radio" name="primary-image" :checked="image.isPrimary" @change="primary(i)" />
        {{ t('catalog', 'primary') }}</label
      >
      <div class="form-actions">
        <HcButton variant="quiet" :disabled="i === 0" @click="move(i, -1)">{{
          t('catalog', 'moveUp')
        }}</HcButton>
        <HcButton variant="quiet" :disabled="i === form.images.length - 1" @click="move(i, 1)">{{
          t('catalog', 'moveDown')
        }}</HcButton>
        <HcButton variant="quiet" @click="remove(i)">{{ t('catalog', 'remove') }}</HcButton>
      </div>
    </fieldset>
    <HcButton
      variant="quiet"
      :disabled="form.images.length >= 12"
      @click="form.images.push({ storageKey: '', altText: '', isPrimary: !form.images.length })"
      >{{ t('catalog', 'addImage') }}</HcButton
    >
  </section>
</template>
