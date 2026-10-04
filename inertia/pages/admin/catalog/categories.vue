<script setup lang="ts">
import { Head } from '@inertiajs/vue3'
import { ref } from 'vue'
import AdminLayout from '~/app/layouts/AdminLayout.vue'
import HcPanel from '~/app/design/HcPanel.vue'
import HcButton from '~/app/design/HcButton.vue'
import CategoryForm from '~/features/catalog/CategoryForm.vue'
import { useI18n } from '~/app/shared/i18n'
import type { Category } from '~/features/catalog/types'
defineProps<{ categories: Category[] }>()
const selected = ref<Category | null>(null)
const { t } = useI18n()
</script>
<template>
  <Head :title="t('catalog', 'categories')"><meta name="robots" content="noindex" /></Head>
  <AdminLayout
    ><HcPanel
      ><div class="catalog-toolbar">
        <h1>{{ t('catalog', 'categories') }}</h1>
        <HcButton variant="quiet" @click="selected = null">{{
          t('catalog', 'newCategory')
        }}</HcButton>
      </div>
      <div class="table-scroll">
        <table class="catalog-table">
          <thead>
            <tr>
              <th>{{ t('catalog', 'name') }}</th>
              <th>{{ t('catalog', 'slug') }}</th>
              <th>{{ t('catalog', 'active') }}</th>
              <th>{{ t('catalog', 'edit') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="category in categories" :key="category.id">
              <td>{{ category.name }}</td>
              <td>{{ category.slug }}</td>
              <td>
                <input
                  type="checkbox"
                  :checked="category.isActive"
                  disabled
                  :aria-label="category.name + ': ' + t('catalog', 'active')"
                />
              </td>
              <td>
                <HcButton variant="quiet" @click="selected = category">{{
                  t('catalog', 'edit')
                }}</HcButton>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <CategoryForm :key="selected?.id ?? 'new'" :category="selected" /> </HcPanel
  ></AdminLayout>
</template>
