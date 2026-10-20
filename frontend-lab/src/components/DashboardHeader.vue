<script setup lang="ts">
import { computed } from 'vue'
import type { LoginData } from '../types/auth'

const props = defineProps<{ user: LoginData }>()

const emit = defineEmits<{
  refresh: []
  logout: []
}>()

const eyebrow = computed(() => `Panel ${props.user.role}`)
const title = computed(() => `Dashboard ${props.user.role.charAt(0).toUpperCase()}${props.user.role.slice(1)}`)
</script>

<template>
  <header class="dash-header">
    <div class="idn">
      <p class="eyebrow">{{ eyebrow }}</p>
      <h1>{{ title }}</h1>
      <p class="sub">
        <span class="mail">{{ user.email }}</span>
        <span class="sep" aria-hidden="true">·</span>
        <span class="role-chip">{{ user.role }}</span>
      </p>
    </div>
    <div class="actions">
      <button class="btn ghost" @click="emit('refresh')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3" />
          <path d="M19.8 4.5v4.2h-4.2" />
        </svg>
        Muat ulang
      </button>
      <button class="btn danger" @click="emit('logout')">Keluar</button>
    </div>
  </header>
</template>

<style scoped>
.dash-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 16px;
  flex-wrap: wrap;
  padding-bottom: 4px;
}

.idn {
  min-width: 0;
}

.eyebrow {
  margin: 0 0 4px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--brand-ink);
  opacity: 0.85;
}

h1 {
  margin: 0;
  color: var(--ink);
}

.sub {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 7px;
  margin: 6px 0 0;
  font-size: 14px;
  color: var(--muted);
}
.mail {
  overflow: hidden;
  text-overflow: ellipsis;
}
.sep {
  opacity: 0.5;
}
.role-chip {
  padding: 2px 9px;
  border-radius: 999px;
  border: 1px solid var(--line);
  background: var(--field);
  font-size: 11.5px;
  font-weight: 600;
  letter-spacing: 0.03em;
  text-transform: capitalize;
  color: var(--brand-ink);
}

.actions {
  display: flex;
  gap: 9px;
  flex-wrap: wrap;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 9px 15px;
  border-radius: var(--r-md);
  font-family: inherit;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  width: auto;
  transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease,
    border-color 0.18s ease;
}
.btn svg {
  width: 16px;
  height: 16px;
}
.btn:focus-visible {
  outline: 2px solid var(--brand);
  outline-offset: 2px;
}

.btn.ghost {
  background: var(--card);
  border: 1px solid var(--line);
  color: var(--ink);
  box-shadow: var(--shadow-1);
}
.btn.ghost:hover {
  border-color: var(--brand-soft);
  background: var(--brand-soft);
  color: var(--brand-ink);
  transform: translateY(-1px);
}

.btn.danger {
  background: var(--danger-soft);
  border: 1px solid var(--danger-soft);
  color: var(--danger);
}
.btn.danger:hover {
  background: var(--danger);
  border-color: var(--danger);
  color: #fff;
  transform: translateY(-1px);
}
</style>
