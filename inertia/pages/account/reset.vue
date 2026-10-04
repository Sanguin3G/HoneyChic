<script setup lang="ts">
import { Head, useForm } from '@inertiajs/vue3'
import StorefrontLayout from '~/app/layouts/StorefrontLayout.vue'
import HcPanel from '~/app/design/HcPanel.vue'
import HcInput from '~/app/design/HcInput.vue'
import HcButton from '~/app/design/HcButton.vue'
import HcNotice from '~/app/design/HcNotice.vue'
import { useI18n } from '~/app/shared/i18n'

const props = defineProps<{ id: string; secret: string }>()
const { t } = useI18n()
const form = useForm({ password: '', password_confirmation: '' })
function submit() {
  form.post('/password/reset/' + props.id + '/' + props.secret, {
    onFinish: () => form.reset('password', 'password_confirmation'),
  })
}
</script>

<template>
  <Head :title="t('auth', 'resetTitle')"><meta name="robots" content="noindex" /></Head>
  <StorefrontLayout>
    <HcPanel class="account-panel">
      <h1>{{ t('auth', 'resetTitle') }}</h1>
      <HcNotice />
      <p class="hc-help">{{ t('auth', 'passwordHelp') }}</p>
      <form class="hc-form" @submit.prevent="submit">
        <HcInput
          id="password"
          v-model="form.password"
          :label="t('auth', 'password')"
          :error="form.errors.password"
          type="password"
          autocomplete="new-password"
          minlength="12"
          maxlength="128"
          required
        />
        <HcInput
          id="password_confirmation"
          v-model="form.password_confirmation"
          :label="t('auth', 'confirmPassword')"
          :error="form.errors.password_confirmation"
          type="password"
          autocomplete="new-password"
          minlength="12"
          maxlength="128"
          required
        />
        <HcButton type="submit" :disabled="form.processing">{{
          t('auth', 'resetSubmit')
        }}</HcButton>
      </form>
    </HcPanel>
  </StorefrontLayout>
</template>
