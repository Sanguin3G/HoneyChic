<script setup lang="ts">
import { useForm } from '@inertiajs/vue3'
import HcInput from '~/app/design/HcInput.vue'
import HcButton from '~/app/design/HcButton.vue'
import HcNotice from '~/app/design/HcNotice.vue'
import BrandImageField from '~/features/settings/BrandImageField.vue'
import { useI18n } from '~/app/shared/i18n'
import type { StoreSettings } from '~/features/settings/types'
const props = defineProps<{ settings: StoreSettings }>()
const { t } = useI18n()
const form = useForm({ ...props.settings })
function picker(value: string | null, fallback: string) {
  return value && /^#[0-9a-fA-F]{6}$/.test(value) ? value : fallback
}
function pickColor(field: 'primaryColor' | 'accentColor', event: Event) {
  form[field] = (event.target as HTMLInputElement).value
}
function save() {
  form
    .transform((data) => ({
      name: data.name,
      description: data.description,
      email: data.email || null,
      phone: data.phone || null,
      address: data.address,
      currency: data.currency,
      defaultLocale: data.defaultLocale,
      timezone: data.timezone,
      orderPrefix: data.orderPrefix,
      lowStockThreshold: data.lowStockThreshold,
      customerAccountsEnabled: data.customerAccountsEnabled,
      registrationEnabled: data.registrationEnabled,
      guestCheckoutEnabled: data.guestCheckoutEnabled,
      logoKey: data.logoKey || null,
      faviconKey: data.faviconKey || null,
      website: data.website || null,
      facebook: data.facebook || null,
      instagram: data.instagram || null,
      youtube: data.youtube || null,
      tiktok: data.tiktok || null,
      primaryColor: data.primaryColor || null,
      accentColor: data.accentColor || null,
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
      <legend>{{ t('settings', 'brand') }}</legend>
      <div class="form-grid">
        <BrandImageField
          id="logo-file"
          v-model="form.logoKey"
          :label="t('settings', 'logo')"
          :help="t('settings', 'logoHelp')"
          :url="settings.logoUrl"
          :error="form.errors.logoKey"
        />
        <BrandImageField
          id="favicon-file"
          v-model="form.faviconKey"
          :label="t('settings', 'favicon')"
          :help="t('settings', 'faviconHelp')"
          :url="settings.faviconUrl"
          :error="form.errors.faviconKey"
        />
      </div>
      <div class="form-grid">
        <div class="hc-field">
          <label for="primaryColor">{{ t('settings', 'primaryColor') }}</label>
          <div class="brand-color">
            <input
              id="primaryColor"
              v-model="form.primaryColor"
              class="hc-input"
              maxlength="7"
              placeholder="#172d48"
              :aria-invalid="form.errors.primaryColor ? true : undefined"
              :aria-describedby="
                form.errors.primaryColor ? 'primaryColor-error color-help' : 'color-help'
              "
            />
            <input
              id="primaryColor-picker"
              type="color"
              :aria-label="t('settings', 'primaryColor')"
              :value="picker(form.primaryColor, '#172d48')"
              @input="pickColor('primaryColor', $event)"
            />
          </div>
          <p v-if="form.errors.primaryColor" id="primaryColor-error" class="hc-error" role="alert">
            {{ form.errors.primaryColor }}
          </p>
          <HcButton
            id="primaryColor-clear"
            variant="quiet"
            type="button"
            @click="form.primaryColor = null"
            >{{ t('settings', 'clearColor') }}</HcButton
          >
        </div>
        <div class="hc-field">
          <label for="accentColor">{{ t('settings', 'accentColor') }}</label>
          <div class="brand-color">
            <input
              id="accentColor"
              v-model="form.accentColor"
              class="hc-input"
              maxlength="7"
              placeholder="#e5802e"
              :aria-invalid="form.errors.accentColor ? true : undefined"
              :aria-describedby="
                form.errors.accentColor ? 'accentColor-error color-help' : 'color-help'
              "
            />
            <input
              id="accentColor-picker"
              type="color"
              :aria-label="t('settings', 'accentColor')"
              :value="picker(form.accentColor, '#e5802e')"
              @input="pickColor('accentColor', $event)"
            />
          </div>
          <p v-if="form.errors.accentColor" id="accentColor-error" class="hc-error" role="alert">
            {{ form.errors.accentColor }}
          </p>
          <HcButton
            id="accentColor-clear"
            variant="quiet"
            type="button"
            @click="form.accentColor = null"
            >{{ t('settings', 'clearColor') }}</HcButton
          >
        </div>
      </div>
      <p id="color-help" class="hc-help">{{ t('settings', 'colorHelp') }}</p>
    </fieldset>
    <fieldset>
      <legend>{{ t('settings', 'socials') }}</legend>
      <p class="hc-help">{{ t('settings', 'socialHelp') }}</p>
      <div class="form-grid">
        <HcInput
          id="website"
          v-model="form.website"
          :label="t('settings', 'website')"
          :error="form.errors.website"
          maxlength="300"
        />
        <HcInput
          id="facebook"
          v-model="form.facebook"
          :label="t('settings', 'facebook')"
          :error="form.errors.facebook"
          maxlength="300"
        />
        <HcInput
          id="instagram"
          v-model="form.instagram"
          :label="t('settings', 'instagram')"
          :error="form.errors.instagram"
          maxlength="300"
        />
        <HcInput
          id="youtube"
          v-model="form.youtube"
          :label="t('settings', 'youtube')"
          :error="form.errors.youtube"
          maxlength="300"
        />
        <HcInput
          id="tiktok"
          v-model="form.tiktok"
          :label="t('settings', 'tiktok')"
          :error="form.errors.tiktok"
          maxlength="300"
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
