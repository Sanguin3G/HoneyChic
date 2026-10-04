<script setup lang="ts">
import { Head, Link, useForm, usePage } from '@inertiajs/vue3'
import AdminLayout from '~/app/layouts/AdminLayout.vue'
import HcPanel from '~/app/design/HcPanel.vue'
import HcButton from '~/app/design/HcButton.vue'
import HcNotice from '~/app/design/HcNotice.vue'
import CapabilityPanel from '~/features/settings/CapabilityPanel.vue'
import { useI18n, type SharedProps } from '~/app/shared/i18n'
const props = defineProps<{
  settings: {
    guestCheckoutEnabled: boolean
    customerAccountsEnabled: boolean
    registrationEnabled: boolean
    reviewsEnabled: boolean
    wishlistEnabled: boolean
    couponsEnabled: boolean
    shippingEnabled: boolean
    codEnabled: boolean
    fakePaymentEnabled: boolean
  }
}>()
const page = usePage<SharedProps>()
const { t } = useI18n()
const form = useForm({ ...props.settings })
</script>
<template>
  <Head :title="t('admin', 'modules')"><meta name="robots" content="noindex,nofollow" /></Head>
  <AdminLayout
    ><HcPanel
      ><h1>{{ t('admin', 'modules') }}</h1>
      <HcNotice />
      <p>{{ t('admin', 'moduleHelp') }}</p>
      <Link href="/admin/module-configuration">{{ t('modules', 'configuration') }}</Link>
      <form
        v-if="page.props.permissions.manageStore"
        class="hc-form"
        @submit.prevent="form.put('/admin/modules')"
      >
        <label class="hc-check"
          ><input v-model="form.guestCheckoutEnabled" type="checkbox" />{{
            t('admin', 'guestCheckout')
          }}</label
        >
        <label class="hc-check"
          ><input v-model="form.customerAccountsEnabled" type="checkbox" />{{
            t('settings', 'customerAccountsEnabled')
          }}</label
        >
        <label class="hc-check"
          ><input v-model="form.registrationEnabled" type="checkbox" />{{
            t('settings', 'registrationEnabled')
          }}</label
        >
        <label
          v-for="flag in [
            'reviewsEnabled',
            'wishlistEnabled',
            'couponsEnabled',
            'shippingEnabled',
            'codEnabled',
            'fakePaymentEnabled',
          ] as const"
          :key="flag"
          class="hc-check"
          ><input v-model="form[flag]" type="checkbox" />{{ t('modules', flag) }}</label
        >
        <p class="hc-help">{{ t('modules', 'fakeHelp') }}</p>
        <p v-for="(error, key) in form.errors" :key="key" class="hc-error" role="alert">
          {{ error }}
        </p>
        <p class="hc-help">{{ t('settings', 'accountsHelp') }}</p>
        <HcButton type="submit" :disabled="form.processing">{{ t('admin', 'save') }}</HcButton>
      </form> </HcPanel
    ><CapabilityPanel
  /></AdminLayout>
</template>
