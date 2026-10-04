<script setup lang="ts">
import { useForm } from '@inertiajs/vue3'
import HcInput from '~/app/design/HcInput.vue'
import HcButton from '~/app/design/HcButton.vue'
import HcNotice from '~/app/design/HcNotice.vue'
import { useI18n } from '~/app/shared/i18n'
import type { StoreSettings } from '~/features/settings/types'
const props = defineProps<{ settings: StoreSettings }>()
const { t } = useI18n()
const form = useForm({ ...props.settings })
function save() {
  form
    .transform((data) => ({
      ...data,
      email: data.email || null,
      phone: data.phone || null,
    }))
    .put('/admin/settings', { preserveScroll: true })
}
</script>

<template>
  <HcNotice />
  <form class="hc-form" @submit.prevent="save">
    <fieldset>
      <legend>{{ t('settings', 'business') }}</legend>
      <div class="form-grid">
        <HcInput
          id="name"
          v-model="form.name"
          :label="t('settings', 'name')"
          :error="form.errors.name"
          maxlength="120"
          required
        />
        <HcInput
          id="email"
          v-model="form.email"
          :label="t('auth', 'email')"
          :error="form.errors.email"
          type="email"
          maxlength="254"
        />
        <HcInput
          id="phone"
          v-model="form.phone"
          :label="t('settings', 'phone')"
          :error="form.errors.phone"
          type="tel"
          maxlength="40"
        />
        <HcInput
          id="description"
          v-model="form.description"
          :label="t('settings', 'description')"
          :error="form.errors.description"
          maxlength="2000"
        />
        <HcInput
          id="address"
          v-model="form.address"
          :label="t('settings', 'address')"
          :error="form.errors.address"
          maxlength="1000"
        />
      </div>
    </fieldset>
    <fieldset>
      <legend>{{ t('settings', 'regional') }}</legend>
      <div class="form-grid">
        <HcInput
          id="currency"
          v-model="form.currency"
          :aria-describedby="
            form.errors.currency ? 'currency-error currency-help' : 'currency-help'
          "
          :label="t('settings', 'currency')"
          :error="form.errors.currency"
          minlength="3"
          maxlength="3"
          required
        />
        <p id="currency-help">{{ t('catalog', 'currencyHelp') }}</p>
        <div class="hc-field">
          <label for="defaultLocale">{{ t('settings', 'defaultLocale') }}</label>
          <select
            id="defaultLocale"
            v-model="form.defaultLocale"
            class="hc-input"
            :aria-invalid="form.errors.defaultLocale ? true : undefined"
            :aria-describedby="form.errors.defaultLocale ? 'defaultLocale-error' : undefined"
          >
            <option value="en">{{ t('navigation', 'en') }}</option>
            <option value="vi">{{ t('navigation', 'vi') }}</option>
          </select>
          <p
            v-if="form.errors.defaultLocale"
            id="defaultLocale-error"
            class="hc-error"
            role="alert"
          >
            {{ form.errors.defaultLocale }}
          </p>
        </div>
        <HcInput
          id="timezone"
          v-model="form.timezone"
          :label="t('settings', 'timezone')"
          :error="form.errors.timezone"
          maxlength="80"
          required
        />
      </div>
    </fieldset>
    <fieldset>
      <legend>{{ t('settings', 'preferences') }}</legend>
      <div class="form-grid">
        <HcInput
          id="orderPrefix"
          v-model="form.orderPrefix"
          :label="t('settings', 'orderPrefix')"
          :error="form.errors.orderPrefix"
          maxlength="12"
          required
        />
        <HcInput
          id="lowStockThreshold"
          v-model="form.lowStockThreshold"
          :label="t('settings', 'lowStockThreshold')"
          :error="form.errors.lowStockThreshold"
          type="number"
          min="0"
          max="1000000"
          step="1"
          required
        />
      </div>
      <label class="hc-check">
        <input v-model="form.customerAccountsEnabled" type="checkbox" />
        {{ t('settings', 'customerAccountsEnabled') }}
      </label>
      <p v-if="form.errors.customerAccountsEnabled" class="hc-error" role="alert">
        {{ form.errors.customerAccountsEnabled }}
      </p>
      <label class="hc-check">
        <input v-model="form.registrationEnabled" type="checkbox" />
        {{ t('settings', 'registrationEnabled') }}
      </label>
      <p v-if="form.errors.registrationEnabled" class="hc-error" role="alert">
        {{ form.errors.registrationEnabled }}
      </p>
      <label class="hc-check"
        ><input v-model="form.guestCheckoutEnabled" type="checkbox" />{{
          t('admin', 'guestCheckout')
        }}</label
      >
      <p class="hc-help">{{ t('settings', 'accountsHelp') }}</p>
    </fieldset>
    <HcButton type="submit" :disabled="form.processing">{{ t('settings', 'save') }}</HcButton>
  </form>
</template>
