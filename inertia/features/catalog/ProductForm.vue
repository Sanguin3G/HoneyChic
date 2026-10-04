<script setup lang="ts">
import { computed } from 'vue'
import { Link, useForm } from '@inertiajs/vue3'
import HcInput from '~/app/design/HcInput.vue'
import HcTextarea from '~/app/design/HcTextarea.vue'
import HcButton from '~/app/design/HcButton.vue'
import { useI18n } from '~/app/shared/i18n'
import OptionEditor from './OptionEditor.vue'
import VariantEditor from './VariantEditor.vue'
import ImageEditor from './ImageEditor.vue'
import type { ProductFormData } from './types'
const props = defineProps<{
  productId: number | null
  product: ProductFormData | null
  currency: string
  categories: { id: number; name: string }[]
}>()
const { t } = useI18n()
const form = useForm<ProductFormData>(
  props.product ?? {
    name: '',
    slug: '',
    description: '',
    categoryId: null,
    status: 'draft',
    options: [],
    variants: [{ sku: '', price: '0', selections: [] }],
    images: [],
  }
)
const definition = computed({
  get: () => form,
  set: (value: ProductFormData) => Object.assign(form, value),
})
function submit() {
  if (props.productId) form.put('/admin/products/' + props.productId)
  else form.post('/admin/products')
}
</script>
<template>
  <form @submit.prevent="submit">
    <div class="catalog-grid">
      <HcInput
        id="product-name"
        v-model="form.name"
        :label="t('catalog', 'name')"
        :error="form.errors.name"
        maxlength="180"
        required
      />
      <HcInput
        id="product-slug"
        v-model="form.slug"
        :label="t('catalog', 'slug')"
        :error="form.errors.slug"
        maxlength="200"
        required
      />
      <div class="hc-field">
        <label for="category">{{ t('catalog', 'category') }}</label>
        <select id="category" v-model="form.categoryId" class="hc-input">
          <option :value="null">{{ t('catalog', 'uncategorized') }}</option>
          <option v-for="category in categories" :key="category.id" :value="category.id">
            {{ category.name }}
          </option>
        </select>
        <p v-if="form.errors.categoryId" class="hc-error" role="alert">
          {{ form.errors.categoryId }}
        </p>
      </div>
      <div class="hc-field">
        <label for="status">{{ t('catalog', 'status') }}</label
        ><select id="status" v-model="form.status" class="hc-input">
          <option
            v-for="status in ['draft', 'published', 'archived']"
            :key="status"
            :value="status"
          >
            {{ t('catalog', status) }}
          </option>
        </select>
      </div>
    </div>
    <HcTextarea
      id="product-description"
      v-model="form.description"
      :label="t('catalog', 'description')"
      :error="form.errors.description"
      maxlength="10000"
    />
    <OptionEditor v-model:form="definition" :errors="form.errors" />
    <VariantEditor v-model:form="definition" :currency="currency" :errors="form.errors" />
    <ImageEditor v-model:form="definition" :errors="form.errors" />
    <div class="form-actions">
      <HcButton type="submit" :disabled="form.processing">{{ t('catalog', 'save') }}</HcButton
      ><Link href="/admin/products">{{ t('catalog', 'back') }}</Link>
    </div>
  </form>
</template>
