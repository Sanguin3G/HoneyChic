<script setup lang="ts">
import { useForm } from '@inertiajs/vue3'
import HcInput from '~/app/design/HcInput.vue'
import HcTextarea from '~/app/design/HcTextarea.vue'
import HcButton from '~/app/design/HcButton.vue'
import { useI18n } from '~/app/shared/i18n'
import type { Category } from './types'
const props = defineProps<{ category: Category | null }>()
const { t } = useI18n()
const form = useForm({
  name: props.category?.name ?? '',
  slug: props.category?.slug ?? '',
  description: props.category?.description ?? '',
  isActive: props.category?.isActive ?? true,
})
function submit() {
  if (props.category) form.put('/admin/categories/' + props.category.id)
  else form.post('/admin/categories')
}
</script>
<template>
  <form @submit.prevent="submit">
    <h2>{{ category ? t('catalog', 'edit') : t('catalog', 'newCategory') }}</h2>
    <HcInput
      id="category-name"
      v-model="form.name"
      :label="t('catalog', 'name')"
      :error="form.errors.name"
      required
      maxlength="120"
    />
    <HcInput
      id="category-slug"
      v-model="form.slug"
      :label="t('catalog', 'slug')"
      :error="form.errors.slug"
      required
      maxlength="140"
    />
    <HcTextarea
      id="category-description"
      v-model="form.description"
      :label="t('catalog', 'description')"
      :error="form.errors.description"
    />
    <label><input v-model="form.isActive" type="checkbox" /> {{ t('catalog', 'active') }}</label>
    <div class="form-actions">
      <HcButton type="submit" :disabled="form.processing">{{ t('catalog', 'save') }}</HcButton>
    </div>
  </form>
</template>
