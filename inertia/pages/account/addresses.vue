<script setup lang="ts">
import { Head, router } from '@inertiajs/vue3'
import AccountLayout from '~/app/layouts/AccountLayout.vue'
import HcPanel from '~/app/design/HcPanel.vue'
import HcButton from '~/app/design/HcButton.vue'
import AddressForm from '~/features/account/AddressForm.vue'
import type { Address } from '~/features/orders/types'
import { useI18n } from '~/app/shared/i18n'
defineProps<{ addresses: Address[] }>()
const { t } = useI18n()
function remove(id: number) {
  if (window.confirm(t('orders', 'confirmDeleteAddress'))) router.delete('/account/addresses/' + id)
}
</script>
<template>
  <Head :title="t('orders', 'addresses')"><meta name="robots" content="noindex,nofollow" /></Head>
  <AccountLayout>
    <h1>{{ t('orders', 'addresses') }}</h1>
    <HcPanel v-for="address in addresses" :key="address.id"
      ><h2>{{ address.label }}</h2>
      <AddressForm :address="address" /><HcButton variant="quiet" @click="remove(address.id)">{{
        t('orders', 'deleteAddress')
      }}</HcButton></HcPanel
    >
    <HcPanel
      ><h2>{{ t('orders', 'saveAddress') }}</h2>
      <AddressForm
    /></HcPanel>
  </AccountLayout>
</template>
