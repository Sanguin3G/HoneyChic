<script setup lang="ts">
import { ref } from 'vue'
import HcInput from '~/app/design/HcInput.vue'
import HcButton from '~/app/design/HcButton.vue'
import { useI18n } from '~/app/shared/i18n'
import type { ProductFormData } from './types'
const form = defineModel<ProductFormData>('form', { required: true })
const props = defineProps<{
  errors: Record<string, string | undefined>
  initialUrls?: string[]
}>()
const { t } = useI18n()
const urls = ref<Record<string, string>>({})
for (const [index, url] of (props.initialUrls ?? []).entries()) {
  const key = form.value.images[index]?.storageKey
  if (key && url) urls.value[key] = url
}
const uploadErrors = ref<string[]>([])
const uploading = ref<number | null>(null)
const safeKey = /^(?:[A-Za-z0-9_-]+\/)*[A-Za-z0-9_-]+\.(?:jpg|jpeg|png|webp|avif|svg)$/
function primary(index: number) {
  form.value.images.forEach((image, i) => (image.isPrimary = i === index))
}
function remove(index: number) {
  const wasPrimary = form.value.images[index].isPrimary
  form.value.images.splice(index, 1)
  uploadErrors.value.splice(index, 1)
  if (wasPrimary) primary(0)
}
function move(index: number, offset: number) {
  const next = index + offset
  const [image] = form.value.images.splice(index, 1)
  form.value.images.splice(next, 0, image)
  const [uploadError] = uploadErrors.value.splice(index, 1)
  uploadErrors.value.splice(next, 0, uploadError)
}
function preview(index: number) {
  const key = form.value.images[index]?.storageKey ?? ''
  if (urls.value[key]) return urls.value[key]
  return safeKey.test(key) ? '/media/' + key : ''
}
function csrf() {
  const encoded = document.cookie
    .split('; ')
    .find((row) => row.startsWith('XSRF-TOKEN='))
    ?.slice('XSRF-TOKEN='.length)
  return encoded ? decodeURIComponent(encoded) : ''
}
async function upload(index: number, event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  uploading.value = index
  uploadErrors.value[index] = ''
  const body = new FormData()
  body.append('image', file)
  try {
    const response = await fetch('/admin/products/images', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Accept': 'application/json', 'X-XSRF-TOKEN': csrf() },
      body,
    })
    const payload = (await response.json()) as {
      storageKey?: string
      url?: string
      errors?: { message?: string }[]
    }
    if (!response.ok || !payload.storageKey) {
      uploadErrors.value[index] = payload.errors?.[0]?.message || t('catalog', 'uploadFailed')
      return
    }
    form.value.images[index].storageKey = payload.storageKey
    if (payload.url) urls.value[payload.storageKey] = payload.url
  } catch {
    uploadErrors.value[index] = t('catalog', 'uploadFailed')
  } finally {
    uploading.value = null
  }
}
</script>
<template>
  <section class="catalog-section">
    <h2>{{ t('catalog', 'images') }}</h2>
    <p>{{ t('catalog', 'imageHelp') }}</p>
    <p v-if="errors.images" class="hc-error" role="alert">{{ errors.images }}</p>
    <fieldset v-for="(image, i) in form.images" :key="i" class="catalog-row">
      <legend>{{ t('catalog', 'images') }} {{ i + 1 }}</legend>
      <img
        v-if="preview(i)"
        class="catalog-preview"
        :src="preview(i)"
        :alt="image.altText"
        width="72"
        height="72"
      />
      <div class="hc-field">
        <label :for="'image-file-' + i">{{ t('catalog', 'uploadImage') }}</label>
        <input
          :id="'image-file-' + i"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          :disabled="uploading === i"
          @change="upload(i, $event)"
        />
        <p v-if="uploading === i">{{ t('catalog', 'uploading') }}</p>
        <p v-if="uploadErrors[i]" class="hc-error" role="alert">{{ uploadErrors[i] }}</p>
      </div>
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
