<script setup lang="ts">
import { Link, useForm } from '@inertiajs/vue3'
import HcInput from '~/app/design/HcInput.vue'
import HcButton from '~/app/design/HcButton.vue'
import { useI18n } from '~/app/shared/i18n'

const props = defineProps<{ mode: 'login' | 'register'; canRegister?: boolean }>()
const { t } = useI18n()
const form = useForm({ fullName: '', email: '', password: '', password_confirmation: '' })
function submit() {
  form.post(props.mode === 'login' ? '/login' : '/register', {
    onFinish: () => form.reset('password', 'password_confirmation'),
  })
}
</script>

<template>
  <form class="hc-form" @submit.prevent="submit">
    <HcInput
      v-if="mode === 'register'"
      id="fullName"
      v-model="form.fullName"
      :label="t('auth', 'fullName')"
      :error="form.errors.fullName"
      autocomplete="name"
      maxlength="120"
      required
    />
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
    <HcInput
      id="password"
      v-model="form.password"
      :label="t('auth', 'password')"
      :error="form.errors.password"
      type="password"
      :autocomplete="mode === 'login' ? 'current-password' : 'new-password'"
      :minlength="mode === 'register' ? 12 : 1"
      maxlength="128"
      required
    />
    <template v-if="mode === 'register'">
      <p class="hc-help">{{ t('auth', 'passwordHelp') }}</p>
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
    </template>
    <HcButton type="submit" :disabled="form.processing">{{ t('auth', mode) }}</HcButton>
    <Link v-if="mode === 'login'" href="/forgot-password">{{ t('auth', 'forgot') }}</Link>
    <Link v-if="mode === 'login' && canRegister" href="/register">{{
      t('auth', 'createAccount')
    }}</Link>
    <Link v-if="mode === 'register'" href="/login">{{ t('auth', 'alreadyRegistered') }}</Link>
  </form>
</template>
