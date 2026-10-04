<script setup lang="ts">
import { useForm, usePage } from '@inertiajs/vue3'
import HcPanel from '~/app/design/HcPanel.vue'
import HcTextarea from '~/app/design/HcTextarea.vue'
import HcButton from '~/app/design/HcButton.vue'
import { useI18n, type SharedProps } from '~/app/shared/i18n'
const props = defineProps<{
  slug: string
  reviews: {
    rows: { id: number; rating: number; body: string }[]
    mine: { rating: number; body: string } | null
  }
}>()
const page = usePage<SharedProps>()
const { t } = useI18n()
const form = useForm({
  slug: props.slug,
  rating: props.reviews.mine?.rating ?? 5,
  body: props.reviews.mine?.body ?? '',
  module: '',
})
</script>
<template>
  <HcPanel>
    <h2>{{ t('modules', 'reviews') }}</h2>
    <p v-if="!reviews.rows.length">{{ t('modules', 'noReviews') }}</p>
    <article v-for="row in reviews.rows" :key="row.id">
      <strong>{{ t('modules', 'rating') }}: {{ row.rating }}/5</strong>
      <p class="preserve-lines">{{ row.body }}</p>
    </article>
    <form
      v-if="page.props.auth && page.props.capabilities.customer_accounts.available"
      class="hc-form"
      @submit.prevent="form.post('/account/reviews')"
    >
      <p class="hc-help">{{ t('modules', 'reviewPolicy') }}</p>
      <label class="hc-field"
        >{{ t('modules', 'rating') }}
        <select v-model="form.rating" class="hc-input">
          <option v-for="value in 5" :key="value" :value="value">{{ value }}/5</option>
        </select>
      </label>
      <HcTextarea
        id="review-body"
        v-model="form.body"
        :label="t('modules', 'reviewBody')"
        :error="form.errors.body"
        required
        maxlength="2000"
      />
      <p v-for="(error, key) in form.errors" :key="key" class="hc-error" role="alert">
        {{ error }}
      </p>
      <HcButton type="submit" :disabled="form.processing">{{
        t('modules', 'saveReview')
      }}</HcButton>
    </form>
  </HcPanel>
</template>
