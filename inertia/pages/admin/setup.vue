<script setup lang="ts">
import { Head, Link, useForm } from '@inertiajs/vue3'
import AdminLayout from '~/app/layouts/AdminLayout.vue'
import HcPanel from '~/app/design/HcPanel.vue'
import HcButton from '~/app/design/HcButton.vue'
import HcNotice from '~/app/design/HcNotice.vue'
import HcInput from '~/app/design/HcInput.vue'
import { useI18n } from '~/app/shared/i18n'

const props = defineProps<{
  setup: {
    storeProfile: 'simple_seller' | 'standard_store' | 'catalog_only' | 'custom'
    name: string
    currency: string
    defaultLocale: 'en' | 'vi'
    timezone: string
    orderPrefix: string
  }
}>()
const { t } = useI18n()
const profiles = ['simple_seller', 'standard_store', 'catalog_only', 'custom'] as const
const form = useForm({
  storeProfile: props.setup.storeProfile,
  name: props.setup.name,
  currency: props.setup.currency,
  defaultLocale: props.setup.defaultLocale,
  timezone: props.setup.timezone,
  orderPrefix: props.setup.orderPrefix,
})
</script>

<template>
  <Head :title="t('admin', 'setup')"><meta name="robots" content="noindex,nofollow" /></Head>
  <AdminLayout>
    <HcPanel>
      <h1>{{ t('admin', 'setup') }}</h1>
      <HcNotice />
      <p>{{ t('admin', 'setupHelp') }}</p>
      <form
        class="hc-form"
        @submit.prevent="form.post('/admin/setup', { preserveState: false, preserveScroll: true })"
      >
        <fieldset aria-describedby="setup-profile-help">
          <legend>{{ t('admin', 'setupProfile') }}</legend>
          <p id="setup-profile-help" class="hc-help">{{ t('admin', 'profileHelp') }}</p>
          <label
            v-for="profile in profiles"
            :key="profile"
            class="hc-check hc-choice"
            :for="'setup-profile-' + profile"
          >
            <input
              :id="'setup-profile-' + profile"
              v-model="form.storeProfile"
              type="radio"
              name="storeProfile"
              :value="profile"
              :aria-describedby="'setup-profile-' + profile + '-help'"
            />
            <span class="hc-choice-copy">
              <span>{{ t('admin', profile) }}</span>
              <span :id="'setup-profile-' + profile + '-help'" class="hc-help">{{
                t('admin', profile + 'Help')
              }}</span>
            </span>
          </label>
          <p v-if="form.errors.storeProfile" class="hc-error" role="alert">
            {{ form.errors.storeProfile }}
          </p>
        </fieldset>
        <fieldset>
          <legend>{{ t('admin', 'setupRecord') }}</legend>
          <div class="form-grid">
            <HcInput
              id="setup-name"
              v-model="form.name"
              name="name"
              autocomplete="organization"
              :label="t('settings', 'name')"
              :error="form.errors.name"
              maxlength="120"
              required
            />
            <HcInput
              id="setup-currency"
              v-model="form.currency"
              name="currency"
              autocomplete="off"
              autocapitalize="characters"
              spellcheck="false"
              :label="t('settings', 'currency')"
              :error="form.errors.currency"
              maxlength="3"
              required
              aria-describedby="setup-currency-help"
            />
            <HcInput
              id="setup-timezone"
              v-model="form.timezone"
              name="timezone"
              autocomplete="off"
              spellcheck="false"
              :label="t('settings', 'timezone')"
              :error="form.errors.timezone"
              maxlength="80"
              required
            />
            <HcInput
              id="setup-prefix"
              v-model="form.orderPrefix"
              name="orderPrefix"
              autocomplete="off"
              autocapitalize="characters"
              spellcheck="false"
              :label="t('settings', 'orderPrefix')"
              :error="form.errors.orderPrefix"
              maxlength="12"
              required
            />
          </div>
          <p id="setup-currency-help" class="hc-help">{{ t('admin', 'setupCurrencyHelp') }}</p>
          <fieldset>
            <legend>{{ t('settings', 'defaultLocale') }}</legend>
            <label class="hc-check hc-choice" for="setup-locale-en">
              <input
                id="setup-locale-en"
                v-model="form.defaultLocale"
                type="radio"
                name="defaultLocale"
                value="en"
              />
              <span class="hc-choice-copy"><span>English</span></span>
            </label>
            <label class="hc-check hc-choice" for="setup-locale-vi">
              <input
                id="setup-locale-vi"
                v-model="form.defaultLocale"
                type="radio"
                name="defaultLocale"
                value="vi"
              />
              <span class="hc-choice-copy"><span>Tiếng Việt</span></span>
            </label>
            <p v-if="form.errors.defaultLocale" class="hc-error" role="alert">
              {{ form.errors.defaultLocale }}
            </p>
          </fieldset>
        </fieldset>
        <HcButton type="submit" :disabled="form.processing">{{ t('admin', 'setupSave') }}</HcButton>
      </form>
      <p>
        <Link href="/admin/modules">{{ t('admin', 'modules') }}</Link>
        ?
        <Link href="/admin/settings">{{ t('settings', 'title') }}</Link>
        ?
        <Link href="/">{{ t('navigation', 'storefront') }}</Link>
      </p>
    </HcPanel>
  </AdminLayout>
</template>
