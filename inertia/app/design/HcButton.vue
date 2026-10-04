<script setup lang="ts">
withDefaults(
  defineProps<{ variant?: 'primary' | 'quiet'; type?: 'button' | 'submit' | 'reset' }>(),
  { variant: 'primary', type: 'button' }
)
</script>

<template>
  <button :type="type" class="hc-button" :class="`hc-button--${variant}`">
    <slot />
  </button>
</template>
