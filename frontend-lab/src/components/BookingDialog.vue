<script setup lang="ts">
import { ref, watch } from 'vue'
import { formatTime } from '../lib/slot-dates'
import type { SlotItem } from '../types/slot'

const props = defineProps<{
  open: boolean
  item: SlotItem | null
  saving: boolean
  serverError: string
}>()

const emit = defineEmits<{
  close: []
  confirm: [kelas: string]
}>()

const kelas = ref('')
const formError = ref('')

watch(
  () => [props.open, props.item],
  () => {
    kelas.value = ''
    formError.value = ''
  },
  { immediate: true },
)

function onConfirm() {
  if (kelas.value.trim().length > 255) {
    formError.value = 'Kelas maksimal 255 karakter'
    return
  }
  formError.value = ''
  emit('confirm', kelas.value.trim())
}
</script>

<template>
  <div v-if="open && item" class="overlay" @click.self="emit('close')">
    <section class="dialog">
      <h2>Booking slot</h2>
      <p class="summary">
        {{ item.laboratorium?.nama ?? `Lab #${item.laboratoriumId}` }} ·
        {{ formatTime(item.tglmulai) }} – {{ formatTime(item.tglselesai) }}
      </p>
      <label>
        Kelas <span class="opt">(opsional)</span>
        <input v-model="kelas" type="text" maxlength="255" placeholder="Contoh: XII IPA 1" />
      </label>
      <p v-if="formError || serverError" class="error">{{ formError || serverError }}</p>
      <div class="actions">
        <button class="btn ghost" :disabled="saving" @click="emit('close')">Batal</button>
        <button class="btn primary" :disabled="saving" @click="onConfirm">
          {{ saving ? 'Membooking...' : 'Konfirmasi booking' }}
        </button>
      </div>
    </section>
  </div>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  z-index: 40;
  display: grid;
  place-items: center;
  padding: 20px;
  overflow-y: auto;
  background: rgba(22, 18, 44, 0.42);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  animation: fade 0.2s ease both;
}
.dialog {
  width: min(440px, 100%);
  margin: auto;
  box-sizing: border-box;
  padding: 26px 26px 22px;
  display: grid;
  gap: 4px;
  border: 1px solid var(--line);
  border-radius: 22px;
  background: var(--card);
  box-shadow: var(--shadow-2);
  animation: rise 0.28s cubic-bezier(0.22, 1, 0.36, 1) both;
}
h2 {
  margin: 0;
  color: var(--ink);
}
.summary {
  margin: 4px 0 6px;
  font-size: 14px;
  color: var(--muted);
}
label {
  display: grid;
  gap: 6px;
  margin: 8px 0;
  min-width: 0;
  font-size: 11.5px;
  font-weight: 600;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: var(--muted);
}
.opt {
  text-transform: none;
  letter-spacing: normal;
  color: var(--muted);
  font-weight: 400;
}
input {
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  max-width: 100%;
  padding: 11px 13px;
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  background: var(--field);
  color: var(--ink);
  font-family: inherit;
  font-size: 15px;
  letter-spacing: normal;
  text-transform: none;
  transition: border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
}
input::placeholder {
  color: var(--muted);
}
input:focus {
  outline: none;
  border-color: rgba(109, 90, 224, 0.55);
  box-shadow: 0 0 0 4px var(--brand-soft);
  background: var(--card);
}
.error {
  margin: 6px 0 0;
  padding: 10px 13px;
  border: 1px solid var(--danger-soft);
  border-radius: var(--r-md);
  background: var(--danger-soft);
  color: var(--danger);
  font-size: 13.5px;
  line-height: 1.45;
}
.actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 12px;
}
.btn {
  padding: 11px 18px;
  border-radius: var(--r-md);
  font-family: inherit;
  font-size: 14.5px;
  font-weight: 600;
  cursor: pointer;
  width: auto;
  transition: transform 0.16s ease, background 0.16s ease, border-color 0.16s ease,
    color 0.16s ease, box-shadow 0.16s ease;
}
.btn:focus-visible {
  outline: 2px solid var(--brand);
  outline-offset: 2px;
}
.btn.ghost {
  background: transparent;
  border: 1px solid var(--line);
  color: var(--muted);
}
.btn.ghost:hover:not(:disabled) {
  background: var(--field);
  border-color: rgba(109, 90, 224, 0.4);
  color: var(--brand-ink);
}
.btn.primary {
  background: linear-gradient(135deg, var(--brand-2), var(--brand));
  border: 1px solid transparent;
  color: #fff;
  box-shadow: 0 14px 24px -16px rgba(109, 90, 224, 0.95);
}
.btn.primary:hover:not(:disabled) {
  transform: translateY(-1px);
}
.btn:disabled {
  opacity: 0.65;
  cursor: wait;
}
@keyframes fade {
  from {
    opacity: 0;
  }
}
@keyframes rise {
  from {
    opacity: 0;
    transform: translateY(14px) scale(0.985);
  }
}
@media (prefers-reduced-motion: reduce) {
  .overlay,
  .dialog {
    animation: none;
  }
}
</style>
