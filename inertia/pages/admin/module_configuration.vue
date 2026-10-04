<script setup lang="ts">
import { Head } from '@inertiajs/vue3'
import AdminLayout from '~/app/layouts/AdminLayout.vue'
import HcNotice from '~/app/design/HcNotice.vue'
import ShippingRates from '~/modules/shipping/ShippingRates.vue'
import CouponSettings from '~/modules/coupons/CouponSettings.vue'
type Rates = InstanceType<typeof ShippingRates>['$props']['rates']
type Coupons = InstanceType<typeof CouponSettings>['$props']['coupons']
import { useI18n } from '~/app/shared/i18n'
defineProps<{
  rates: Rates
  coupons: Coupons
}>()
const { t } = useI18n()
</script>
<template>
  <Head :title="t('modules', 'configuration')"
    ><meta name="robots" content="noindex,nofollow"
  /></Head>
  <AdminLayout
    ><h1>{{ t('modules', 'configuration') }}</h1>
    <HcNotice /><ShippingRates :rates="rates" /><CouponSettings :coupons="coupons"
  /></AdminLayout>
</template>
