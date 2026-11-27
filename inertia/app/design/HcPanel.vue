<script setup lang="ts">
defineProps<{ title?: string }>()
</script>

<template>
  <section v-if="title" class="hc-panel hc-panel--titled">
    <header class="hc-titlebar">
      <h2>{{ title }}</h2>
      <slot name="actions" />
    </header>
    <div class="hc-panel-body"><slot /></div>
  </section>
  <section v-else class="hc-panel">
    <slot />
  </section>
</template>
