<script setup lang="ts">
import type { LoginData } from '../types/auth'

defineProps<{ user: LoginData }>()

const emit = defineEmits<{ logout: [] }>()
</script>

<template>
  <section class="card">
    <span class="ico" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
        <rect x="4.5" y="10.5" width="15" height="9.5" rx="3" />
        <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
        <path d="M12 14.4v2" />
      </svg>
    </span>
    <h1>Akses terbatas</h1>
    <p class="sub">Akun {{ user.email }} ({{ user.role }}) tidak punya akses dashboard ini.</p>
    <button class="btn" @click="emit('logout')">Keluar</button>
  </section>
</template>

<style scoped>
.card {
  width: min(420px, 92vw);
  margin: 24px 0;
  padding: 34px 32px 28px;
  box-sizing: border-box;
  display: grid;
  justify-items: center;
  gap: 4px;
  text-align: center;
  border: 1px solid var(--line);
  border-radius: 24px;
  background: var(--card-soft);
  box-shadow: var(--shadow-2);
  backdrop-filter: blur(18px) saturate(140%);
  -webkit-backdrop-filter: blur(18px) saturate(140%);
}
.ico {
  display: grid;
  place-items: center;
  width: 54px;
  height: 54px;
  margin-bottom: 6px;
  border-radius: 18px;
  background: var(--brand-soft);
  color: var(--brand-ink);
}
.ico svg {
  width: 26px;
  height: 26px;
}
h1 {
  margin: 0;
}
.sub {
  margin: 0;
  font-size: 14.5px;
  line-height: 1.6;
  color: var(--muted);
}
.btn {
  margin-top: 18px;
  width: 100%;
  padding: 12px 16px;
  border: 1px solid var(--danger-soft);
  border-radius: var(--r-md);
  background: var(--danger-soft);
  color: var(--danger);
  font-family: inherit;
  font-size: 14.5px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.18s ease, border-color 0.18s ease, color 0.18s ease,
    transform 0.18s ease;
}
.btn:hover {
  background: var(--danger);
  border-color: var(--danger);
  color: #fff;
  transform: translateY(-1px);
}
.btn:focus-visible {
  outline: 2px solid var(--danger);
  outline-offset: 2px;
}
</style>
