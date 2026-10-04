<script setup lang="ts">
import { useForm } from '@inertiajs/vue3'
import HcInput from '~/app/design/HcInput.vue'
import HcTextarea from '~/app/design/HcTextarea.vue'
import HcButton from '~/app/design/HcButton.vue'
import { useI18n } from '~/app/shared/i18n'
const props = defineProps<{ variantId: number; retired?: boolean }>()
const { t } = useI18n()
const form = useForm({
  quantityDelta: '' as string | number | null,
  reason: props.retired ? 'correction' : 'manual_adjustment',
  reference: '',
  note: '',
})
function submit() {
  form.post('/admin/inventory/' + props.variantId + '/adjust', {
    preserveScroll: true,
    onSuccess: () => form.reset(),
  })
}
</script>
<template>
  <form @submit.prevent="submit">
    <h2>{{ t('inventory', 'adjust') }}</h2>
    <div class="catalog-grid">
      <div>
        <HcInput
          id="quantity-delta"
          v-model="form.quantityDelta"
          :label="t('inventory', 'quantityDelta')"
          :error="form.errors.quantityDelta"
          type="number"
          step="1"
          min="-2147483647"
          :max="retired ? -1 : 2147483647"
          :aria-describedby="
            form.errors.quantityDelta ? 'quantity-delta-error delta-help' : 'delta-help'
          "
          required
        />
        <p id="delta-help">{{ t('inventory', 'deltaHelp') }}</p>
      </div>
      <div class="hc-field">
        <label for="inventory-reason">{{ t('inventory', 'reason') }}</label>
        <select
          id="inventory-reason"
          v-model="form.reason"
          class="hc-input"
          :aria-invalid="form.errors.reason ? true : undefined"
          :aria-describedby="form.errors.reason ? 'reason-error' : undefined"
        >
          <option
            v-for="reason in retired
              ? ['correction']
              : ['initial_stock', 'manual_adjustment', 'restock', 'correction']"
            :key="reason"
            :value="reason"
          >
            {{ t('inventory', reason) }}
          </option>
        </select>
        <p v-if="form.errors.reason" id="reason-error" class="hc-error" role="alert">
          {{ form.errors.reason }}
        </p>
      </div>
    </div>
    <HcInput
      id="inventory-reference"
      v-model="form.reference"
      :label="t('inventory', 'reference')"
      :error="form.errors.reference"
      maxlength="200"
    />
    <HcTextarea
      id="inventory-note"
      v-model="form.note"
      :label="t('inventory', 'note')"
      :error="form.errors.note"
      maxlength="500"
    />
    <div class="form-actions">
      <HcButton type="submit" :disabled="form.processing">{{ t('inventory', 'save') }}</HcButton>
    </div>
  </form>
</template>
