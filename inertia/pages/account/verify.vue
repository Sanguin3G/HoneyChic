<script setup lang="ts">
import { Head, useForm } from '@inertiajs/vue3'
import StorefrontLayout from '~/app/layouts/StorefrontLayout.vue'
import HcPanel from '~/app/design/HcPanel.vue'
import HcButton from '~/app/design/HcButton.vue'
import HcNotice from '~/app/design/HcNotice.vue'
import { useI18n } from '~/app/shared/i18n'

const props = defineProps<{ id: string; secret: string }>()
const { t } = useI18n()
const form = useForm({})
function submit() {
  form.post('/email/verify/' + props.id + '/' + props.secret)
}
</script>

<template>
  <Head :title="t('auth', 'verifyTitle')"><meta name="robots" content="noindex" /></Head>
  <StorefrontLayout>
    <HcPanel class="account-panel">
      <h1>{{ t('auth', 'verifyTitle') }}</h1>
      <HcNotice />
      <p>{{ t('auth', 'mailVerifyIntro') }}</p>
      <form class="hc-form" @submit.prevent="submit">
        <HcButton type="submit" :disabled="form.processing">{{
          t('auth', 'verifySubmit')
        }}</HcButton>
      </form>
    </HcPanel>
  </StorefrontLayout>
</template>
