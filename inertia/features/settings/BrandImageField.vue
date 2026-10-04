<script setup lang="ts">
import { ref } from 'vue'
import HcButton from '~/app/design/HcButton.vue'
import { useI18n } from '~/app/shared/i18n'

const key = defineModel<string | null>({ required: true })
const props = defineProps<{
  id: string
  label: string
  help: string
  url: string | null
  error?: string
}>()
const { t } = useI18n()
const preview = ref(props.url ?? '')
const uploadError = ref('')
const uploading = ref(false)

function csrf() {
  const encoded = document.cookie
    .split('; ')
    .find((row) => row.startsWith('XSRF-TOKEN='))
    ?.slice('XSRF-TOKEN='.length)
  return encoded ? decodeURIComponent(encoded) : ''
}

async function upload(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  uploading.value = true
  uploadError.value = ''
  const body = new FormData()
  body.append('image', file)
  try {
    const response = await fetch('/admin/settings/images', {
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
      uploadError.value = payload.errors?.[0]?.message || t('settings', 'uploadFailed')
      return
    }
    key.value = payload.storageKey
    if (payload.url) preview.value = payload.url
  } catch {
    uploadError.value = t('settings', 'uploadFailed')
  } finally {
    uploading.value = false
  }
}

function remove() {
  key.value = null
  preview.value = ''
  uploadError.value = ''
}
</script>

<template>
  <div class="hc-field">
    <label :for="id">{{ label }}</label>
    <img
      v-if="preview"
      :id="id + '-preview'"
      class="brand-preview"
      :src="preview"
      alt=""
      width="72"
      height="72"
    />
    <input
      :id="id"
      class="brand-file"
      type="file"
      accept="image/jpeg,image/png,image/webp,image/avif"
      :disabled="uploading"
      :aria-describedby="id + '-help'"
      @change="upload"
    />
    <p :id="id + '-help'" class="hc-help">{{ help }}</p>
    <p v-if="uploading">{{ t('settings', 'uploading') }}</p>
    <p v-if="uploadError || error" class="hc-error" role="alert">{{ uploadError || error }}</p>
    <HcButton v-if="key" :id="id + '-remove'" variant="quiet" type="button" @click="remove">{{
      t('settings', 'removeImage')
    }}</HcButton>
  </div>
</template>
