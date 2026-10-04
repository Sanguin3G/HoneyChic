<script setup lang="ts">
import { Head, useForm } from '@inertiajs/vue3'
import StorefrontLayout from '~/app/layouts/StorefrontLayout.vue'
import HcPanel from '~/app/design/HcPanel.vue'
import HcInput from '~/app/design/HcInput.vue'
import HcButton from '~/app/design/HcButton.vue'
import HcNotice from '~/app/design/HcNotice.vue'
import { useI18n } from '~/app/shared/i18n'

const { t } = useI18n()
const form = useForm({ email: '' })
function submit() {
  form.post('/forgot-password')
}
</script>

<template>
  <Head :title="t('auth', 'forgotTitle')"><meta name="robots" content="noindex" /></Head>
  <StorefrontLayout>
    <HcPanel class="account-panel">
      <h1>{{ t('auth', 'forgotTitle') }}</h1>
      <HcNotice />
      <form class="hc-form" @submit.prevent="submit">
        <HcInput
          id="email"
          v-model="form.email"
          :label="t('auth', 'email')"
          :error="form.errors.email"
          type="email"
          autocomplete="username"
          maxlength="254"
          required
        />
        <HcButton type="submit" :disabled="form.processing">{{ t('auth', 'sendReset') }}</HcButton>
      </form>
    </HcPanel>
  </StorefrontLayout>
</template>
