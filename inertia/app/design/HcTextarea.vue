<script setup lang="ts">
defineOptions({ inheritAttrs: false })
defineProps<{ id: string; label: string; error?: string }>()
const model = defineModel<string>()
</script>
<template>
  <div class="hc-field">
    <label :for="id">{{ label }}</label>
    <textarea
      :id="id"
      v-model="model"
      class="hc-input"
      rows="5"
      :aria-invalid="error ? true : undefined"
      :aria-describedby="error ? id + '-error' : undefined"
      v-bind="$attrs"
    />
    <p v-if="error" :id="id + '-error'" class="hc-error" role="alert">{{ error }}</p>
  </div>
</template>
