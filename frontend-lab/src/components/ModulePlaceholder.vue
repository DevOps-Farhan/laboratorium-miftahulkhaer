<script setup lang="ts">
defineProps<{ title: string; note: string }>()
</script>

<template>
  <section class="placeholder">
    <span class="ico" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 7.6V12l3 1.8" />
        <circle cx="12" cy="12" r="8.4" />
      </svg>
    </span>
    <span class="tag">Segera hadir</span>
    <h2>{{ title }}</h2>
    <p>{{ note }}</p>
  </section>
</template>

<style scoped>
.placeholder {
  display: grid;
  justify-items: center;
  gap: 8px;
  padding: 44px 24px;
  text-align: center;
  border: 1px dashed rgba(109, 90, 224, 0.42);
  border-radius: var(--r-lg);
  background: var(--card-soft);
  box-shadow: var(--shadow-1);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}
.ico {
  display: grid;
  place-items: center;
  width: 54px;
  height: 54px;
  border-radius: 18px;
  background: var(--brand-soft);
  color: var(--brand-ink);
}
.ico svg {
  width: 27px;
  height: 27px;
}
.tag {
  margin-top: 4px;
  padding: 3px 11px;
  border-radius: 999px;
  background: var(--brand-soft);
  color: var(--brand-ink);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
h2 {
  margin: 2px 0 0;
  color: var(--ink);
}
p {
  margin: 0;
  max-width: 52ch;
  font-size: 14.5px;
  line-height: 1.6;
  color: var(--muted);
}
</style>
