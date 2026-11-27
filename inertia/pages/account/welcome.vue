<script setup lang="ts">
import { Head, useForm } from '@inertiajs/vue3'
import { PhSparkle } from '@phosphor-icons/vue'
import StorefrontLayout from '~/app/layouts/StorefrontLayout.vue'
import HcPanel from '~/app/design/HcPanel.vue'
import HcInput from '~/app/design/HcInput.vue'
import HcButton from '~/app/design/HcButton.vue'
import { useI18n } from '~/app/shared/i18n'
const props = defineProps<{ developmentCode: string | null }>()
const { t } = useI18n()
const form = useForm({
  fullName: '',
  email: '',
  password: '',
  password_confirmation: '',
  setupCode: props.developmentCode ?? '',
})
function submit() {
  form.post('/welcome', { onFinish: () => form.reset('password', 'password_confirmation') })
}
</script>

<template>
  <Head :title="t('auth', 'welcomeTitle')"><meta name="robots" content="noindex" /></Head>
  <StorefrontLayout>
    <HcPanel class="account-panel welcome-panel" :title="t('auth', 'welcomeTitle')">
      <div class="welcome-intro">
        <span class="store-app-icon" aria-hidden="true"
          ><PhSparkle :size="20" weight="fill"
        /></span>
        <p>{{ t('auth', 'welcomeIntro') }}</p>
      </div>
      <form class="hc-form" @submit.prevent="submit">
        <HcInput
          id="setupCode"
          v-model="form.setupCode"
          :label="t('auth', 'setupCode')"
          :error="form.errors.setupCode"
          autocomplete="off"
          maxlength="20"
          required
        />
        <p class="hc-help">
          {{
            developmentCode
              ? t('auth', 'setupCodeDev').replace('{code}', developmentCode)
              : t('auth', 'setupCodeHelp')
          }}
        </p>
        <HcInput
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
        <div class="form-grid">
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
        </div>
        <p class="hc-help">{{ t('auth', 'passwordHelp') }}</p>
        <HcButton type="submit" :disabled="form.processing">{{
          t('auth', 'welcomeSubmit')
        }}</HcButton>
      </form>
    </HcPanel>
  </StorefrontLayout>
</template>

<style scoped>
.welcome-panel {
  max-width: 520px;
}
.welcome-intro {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  color: var(--ink-soft);
}
</style>
