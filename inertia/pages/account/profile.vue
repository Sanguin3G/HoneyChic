<script setup lang="ts">
import { Head, useForm, usePage } from '@inertiajs/vue3'
import AccountLayout from '~/app/layouts/AccountLayout.vue'
import HcPanel from '~/app/design/HcPanel.vue'
import HcInput from '~/app/design/HcInput.vue'
import HcButton from '~/app/design/HcButton.vue'
import HcNotice from '~/app/design/HcNotice.vue'
import { useI18n, type SharedProps } from '~/app/shared/i18n'
const page = usePage<SharedProps>()
const { t } = useI18n()
const form = useForm({ fullName: page.props.auth?.fullName ?? '' })
</script>

<template>
  <Head :title="t('account', 'title')"><meta name="robots" content="noindex" /></Head>
  <AccountLayout>
    <HcPanel>
      <h1>{{ t('account', 'title') }}</h1>
      <HcNotice />
      <p>{{ page.props.auth?.email }}</p>
      <form class="hc-form" @submit.prevent="form.patch('/account')">
        <HcInput
          id="fullName"
          v-model="form.fullName"
          :label="t('auth', 'fullName')"
          :error="form.errors.fullName"
          autocomplete="name"
          maxlength="120"
          required
        />
        <HcButton type="submit" :disabled="form.processing">{{ t('account', 'save') }}</HcButton>
      </form>
      <p class="hc-help">{{ t('account', 'localeHelp') }}</p>
    </HcPanel>
  </AccountLayout>
</template>
