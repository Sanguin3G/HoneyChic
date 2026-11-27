<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'primary' | 'quiet' | 'honey' | 'danger'
    size?: 'normal' | 'small'
    type?: 'button' | 'submit' | 'reset'
  }>(),
  { variant: 'primary', size: 'normal', type: 'button' }
)
</script>

<template>
  <button
    :type="type"
    class="hc-button"
    :class="[`hc-button--${variant}`, { 'hc-button--small': size === 'small' }]"
  >
    <slot />
  </button>
</template>
