<script setup lang="ts">
withDefaults(defineProps<{ text?: string }>(), { text: 'Memuat data...' })
</script>

<template>
  <p class="loading" role="status" aria-live="polite">
    <span class="spinner" aria-hidden="true"></span>
    {{ text }}
  </p>
</template>

<style scoped>
.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin: 0;
  padding: 34px 20px;
  text-align: center;
  font-size: 14.5px;
  color: var(--muted);
}
.spinner {
  width: 22px;
  height: 22px;
  flex: 0 0 auto;
  border-radius: 50%;
  border: 3px solid var(--brand-soft);
  border-top-color: var(--brand);
  animation: spin 0.7s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
@media (prefers-reduced-motion: reduce) {
  .spinner {
    animation: none;
  }
}
</style>
