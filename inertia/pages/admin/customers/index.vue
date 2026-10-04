<script setup lang="ts">
import { Head, Link, useForm } from '@inertiajs/vue3'
import AdminLayout from '~/app/layouts/AdminLayout.vue'
import HcPanel from '~/app/design/HcPanel.vue'
import HcInput from '~/app/design/HcInput.vue'
import HcButton from '~/app/design/HcButton.vue'
import type { Pagination } from '~/features/orders/types'
import { useI18n } from '~/app/shared/i18n'
const props = defineProps<{
  customers: { id: number; fullName: string; email: string }[]
  filters: { q: string }
  pagination: Pagination
}>()
const { t } = useI18n()
const form = useForm({ q: props.filters.q })
</script>
<template>
  <Head :title="t('admin', 'customers')"><meta name="robots" content="noindex,nofollow" /></Head>
  <AdminLayout
    ><HcPanel
      ><h1>{{ t('admin', 'customers') }}</h1>
      <form
        class="admin-filters"
        @submit.prevent="form.transform((data) => (data.q ? data : {})).get('/admin/customers')"
      >
        <HcInput
          id="customer-search"
          v-model="form.q"
          :label="t('admin', 'search')"
          maxlength="120"
        /><HcButton type="submit">{{ t('admin', 'filter') }}</HcButton>
      </form>
      <div class="hc-table-scroll">
        <table class="order-table">
          <thead>
            <tr>
              <th>{{ t('admin', 'name') }}</th>
              <th>{{ t('admin', 'email') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="customer in customers" :key="customer.id">
              <td>
                <Link :href="'/admin/customers/' + customer.id">{{ customer.fullName }}</Link>
              </td>
              <td>{{ customer.email }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-if="!customers.length">{{ t('admin', 'noCustomers') }}</p>
      <nav
        v-if="pagination.lastPage > 1"
        class="cart-toolbar"
        :aria-label="t('catalog', 'pagination')"
      >
        <Link
          v-if="pagination.page > 1"
          :href="
            '/admin/customers?q=' + encodeURIComponent(filters.q) + '&page=' + (pagination.page - 1)
          "
          >{{ t('catalog', 'previous') }}</Link
        ><span>{{ pagination.page }} / {{ pagination.lastPage }}</span
        ><Link
          v-if="pagination.page < pagination.lastPage"
          :href="
            '/admin/customers?q=' + encodeURIComponent(filters.q) + '&page=' + (pagination.page + 1)
          "
          >{{ t('catalog', 'next') }}</Link
        >
      </nav>
    </HcPanel></AdminLayout
  >
</template>
