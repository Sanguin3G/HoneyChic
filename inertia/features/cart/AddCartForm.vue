<script setup lang="ts">
import { useForm } from '@inertiajs/vue3'
import { watch } from 'vue'
import { PhShoppingCart } from '@phosphor-icons/vue'
import HcButton from '~/app/design/HcButton.vue'
import { useI18n } from '~/app/shared/i18n'
const props = defineProps<{ variantId: number; available: boolean }>()
const { t } = useI18n()
const form = useForm({ variantId: props.variantId, quantity: 1 })
watch(
  () => props.variantId,
  (id) => {
    form.variantId = id
    form.quantity = 1
    form.clearErrors()
  }
)
</script>
<template>
  <form class="add-cart-form" @submit.prevent="form.post('/cart/items')">
    <div class="hc-field">
      <label for="add-cart-quantity">{{ t('cart', 'quantity') }}</label>
      <input
        id="add-cart-quantity"
        v-model.number="form.quantity"
        class="hc-input"
        type="number"
        min="1"
        max="99"
        required
        :disabled="!available || form.processing"
        :aria-invalid="!!form.errors.quantity"
        :aria-describedby="form.errors.quantity ? 'add-cart-error' : undefined"
      />
    </div>
    <HcButton type="submit" :disabled="!available || form.processing">
      <PhShoppingCart :size="20" aria-hidden="true" />{{ t('cart', 'add') }}
    </HcButton>
    <p
      v-if="form.errors.quantity || form.errors.variantId"
      id="add-cart-error"
      class="hc-error"
      role="alert"
    >
      {{ form.errors.quantity || form.errors.variantId }}
    </p>
  </form>
</template>
