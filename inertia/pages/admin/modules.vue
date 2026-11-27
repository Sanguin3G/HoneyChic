<script setup lang="ts">
import { Head, useForm, usePage } from '@inertiajs/vue3'
import AdminLayout from '~/app/layouts/AdminLayout.vue'
import HcPanel from '~/app/design/HcPanel.vue'
import HcButton from '~/app/design/HcButton.vue'
import HcNotice from '~/app/design/HcNotice.vue'
import CapabilityPanel from '~/features/settings/CapabilityPanel.vue'
import ShippingRates from '~/modules/shipping/ShippingRates.vue'
import CouponSettings from '~/modules/coupons/CouponSettings.vue'
import { useI18n, type SharedProps } from '~/app/shared/i18n'
type Rates = InstanceType<typeof ShippingRates>['$props']['rates']
type Coupons = InstanceType<typeof CouponSettings>['$props']['coupons']
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
    storeProfile: 'simple_seller' | 'standard_store' | 'catalog_only' | 'custom'
    hasShippingRates?: boolean
  }
  rates: Rates
  coupons: Coupons
}>()
const page = usePage<SharedProps>()
const { t } = useI18n()
const profiles = ['simple_seller', 'standard_store', 'catalog_only', 'custom'] as const
const profileForm = useForm({ storeProfile: props.settings.storeProfile })
const form = useForm({
  guestCheckoutEnabled: props.settings.guestCheckoutEnabled,
  customerAccountsEnabled: props.settings.customerAccountsEnabled,
  registrationEnabled: props.settings.registrationEnabled,
  reviewsEnabled: props.settings.reviewsEnabled,
  wishlistEnabled: props.settings.wishlistEnabled,
  couponsEnabled: props.settings.couponsEnabled,
  shippingEnabled: props.settings.shippingEnabled,
  codEnabled: props.settings.codEnabled,
  fakePaymentEnabled: props.settings.fakePaymentEnabled,
})
const groups = [
  {
    label: 'featureAccounts',
    flags: [
      ['customerAccountsEnabled', 'settings', 'customerAccountsEnabled'],
      ['registrationEnabled', 'settings', 'registrationEnabled'],
      ['guestCheckoutEnabled', 'admin', 'guestCheckout'],
    ],
  },
  {
    label: 'featureShopping',
    flags: [
      ['reviewsEnabled', 'modules', 'reviewsEnabled'],
      ['wishlistEnabled', 'modules', 'wishlistEnabled'],
      ['couponsEnabled', 'modules', 'couponsEnabled'],
      ['shippingEnabled', 'modules', 'shippingEnabled'],
    ],
  },
  {
    label: 'featurePayments',
    flags: [
      ['codEnabled', 'modules', 'codEnabled'],
      ['fakePaymentEnabled', 'modules', 'fakePaymentEnabled'],
    ],
  },
] as const
</script>
<template>
  <Head :title="t('admin', 'modules')"><meta name="robots" content="noindex,nofollow" /></Head>
  <AdminLayout>
    <div class="admin-page-head">
      <div>
        <h1>{{ t('admin', 'modules') }}</h1>
        <p class="hc-help">{{ t('admin', 'moduleHelp') }}</p>
      </div>
    </div>
    <HcNotice />
    <p
      v-if="
        (form.shippingEnabled || profileForm.storeProfile === 'standard_store') &&
        settings.hasShippingRates === false
      "
      class="hc-notice"
      data-tone="error"
    >
      {{ t('modules', 'shippingRateHint') }}
    </p>
    <div class="admin-columns">
      <HcPanel :title="t('admin', 'profiles')">
        <form
          class="feature-profiles"
          @submit.prevent="
            profileForm.post('/admin/modules/profile', {
              preserveState: false,
              preserveScroll: true,
            })
          "
        >
          <fieldset
            :disabled="!page.props.permissions.manageStore"
            aria-describedby="store-profile-help"
          >
            <legend class="visually-hidden">{{ t('admin', 'profiles') }}</legend>
            <p id="store-profile-help" class="hc-help">{{ t('admin', 'profileHelp') }}</p>
            <label
              v-for="profile in profiles"
              :key="profile"
              class="hc-check hc-choice"
              :for="'store-profile-' + profile"
            >
              <input
                :id="'store-profile-' + profile"
                v-model="profileForm.storeProfile"
                type="radio"
                name="storeProfile"
                :value="profile"
                :aria-describedby="'store-profile-' + profile + '-help'"
              />
              <span class="hc-choice-copy">
                <span>{{ t('admin', profile) }}</span>
                <span :id="'store-profile-' + profile + '-help'" class="hc-help">{{
                  t('admin', profile + 'Help')
                }}</span>
              </span>
            </label>
            <p v-for="(error, key) in profileForm.errors" :key="key" class="hc-error" role="alert">
              {{ error }}
            </p>
            <HcButton
              v-if="page.props.permissions.manageStore"
              type="submit"
              :disabled="profileForm.processing"
              >{{ t('admin', 'profileApply') }}</HcButton
            >
          </fieldset>
        </form>
      </HcPanel>
      <HcPanel :title="t('admin', 'featureSwitches')">
        <form class="feature-switches" @submit.prevent="form.put('/admin/modules')">
          <template v-for="group in groups" :key="group.label">
            <p class="hc-group-label">{{ t('admin', group.label) }}</p>
            <div class="hc-group">
              <label v-for="[flag, ns, key] in group.flags" :key="flag" class="hc-check">
                <span>{{ t(ns, key) }}</span>
                <input
                  v-model="form[flag]"
                  class="hc-switch"
                  type="checkbox"
                  role="switch"
                  :disabled="!page.props.permissions.manageStore"
                />
              </label>
            </div>
          </template>
          <p class="hc-group-note">{{ t('modules', 'fakeHelp') }}</p>
          <p class="hc-group-note">{{ t('settings', 'accountsHelp') }}</p>
          <p v-for="(error, key) in form.errors" :key="key" class="hc-error" role="alert">
            {{ error }}
          </p>
          <HcButton
            v-if="page.props.permissions.manageStore"
            type="submit"
            :disabled="form.processing"
            >{{ t('admin', 'save') }}</HcButton
          >
        </form>
      </HcPanel>
    </div>
    <div id="configuration" class="admin-columns">
      <ShippingRates :rates="rates" />
      <CouponSettings :coupons="coupons" />
    </div>
    <details class="capability-details">
      <summary class="hc-button">{{ t('capabilities', 'title') }}</summary>
      <CapabilityPanel />
    </details>
  </AdminLayout>
</template>
<style scoped>
.feature-profiles fieldset {
  display: grid;
  gap: 0.35rem;
  margin: 0;
  padding: 0;
  border: 0;
}
.feature-profiles .hc-button,
.feature-switches > .hc-button {
  justify-self: start;
  margin-top: 0.75rem;
}
.feature-switches {
  display: grid;
}
.feature-switches .hc-group-label:first-child {
  margin-top: 0;
}
.capability-details > summary {
  list-style: none;
}
.capability-details > summary::-webkit-details-marker {
  display: none;
}
.capability-details[open] > summary {
  margin-bottom: 1rem;
}
</style>
