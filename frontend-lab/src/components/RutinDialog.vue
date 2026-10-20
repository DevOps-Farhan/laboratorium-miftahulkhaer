<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import type { CreateRutinPayload, RutinItem, UpdateRutinPayload } from '../types/rutin'
import type { LabItem } from '../types/laboratorium'

const props = defineProps<{
  open: boolean
  editing: RutinItem | null
  saving: boolean
  serverError: string
  labs: LabItem[]
  optionsLoading: boolean
}>()

const emit = defineEmits<{
  close: []
  save: [payload: CreateRutinPayload | UpdateRutinPayload]
}>()

const form = reactive({
  jamMulai: '',
  jamSelesai: '',
  catatan: '',
  laboratoriumId: null as number | null,
})
const formError = ref('')

function toMinutes(v: string): number | null {
  const m = /^(\d{2}):(\d{2})$/.exec(v)
  if (!m) return null
  return Number(m[1]) * 60 + Number(m[2])
}

watch(
  () => [props.open, props.editing],
  () => {
    form.jamMulai = props.editing?.jamMulai ?? ''
    form.jamSelesai = props.editing?.jamSelesai ?? ''
    form.catatan = props.editing?.catatan ?? ''
    form.laboratoriumId = props.editing?.laboratoriumId ?? null
    formError.value = ''
  },
  { immediate: true },
)

function onSubmit() {
  const mulai = toMinutes(form.jamMulai)
  const selesai = toMinutes(form.jamSelesai)
  if (mulai === null) {
    formError.value = 'Jam mulai wajib diisi'
    return
  }
  if (selesai === null) {
    formError.value = 'Jam selesai wajib diisi'
    return
  }
  if (selesai <= mulai) {
    formError.value = 'Jam selesai harus lebih besar dari jam mulai'
    return
  }
  if (!form.laboratoriumId) {
    formError.value = 'Laboratorium wajib dipilih'
    return
  }
  formError.value = ''
  emit('save', {
    jamMulai: form.jamMulai,
    jamSelesai: form.jamSelesai,
    catatan: form.catatan.trim() || undefined,
    laboratoriumId: form.laboratoriumId,
  })
}
</script>

<template>
  <div v-if="open" class="overlay" @click.self="emit('close')">
    <section class="dialog">
      <h2>{{ editing ? `Edit rutin #${editing.id}` : 'Buat jadwal rutin' }}</h2>
      <p class="sub">Berlaku setiap hari. Slot otomatis dibuat 14 hari ke depan.</p>
      <label>
        Laboratorium <span class="req">(wajib)</span>
        <select v-model.number="form.laboratoriumId">
          <option :value="null" disabled>Pilih laboratorium</option>
          <option v-for="lab in labs" :key="lab.id" :value="lab.id">
            {{ lab.kode }} — {{ lab.nama }}
          </option>
        </select>
      </label>
      <div class="row">
        <label>
          Jam mulai
          <input v-model="form.jamMulai" type="time" />
        </label>
        <label>
          Jam selesai
          <input v-model="form.jamSelesai" type="time" />
        </label>
      </div>
      <label>
        Catatan <span class="opt">(opsional)</span>
        <input v-model="form.catatan" type="text" placeholder="Contoh: Jam pagi kelas X" />
      </label>
      <p v-if="optionsLoading" class="hint">Memuat pilihan laboratorium...</p>
      <p v-if="formError || serverError" class="error">{{ formError || serverError }}</p>
      <div class="actions">
        <button class="btn ghost" :disabled="saving" @click="emit('close')">Batal</button>
        <button class="btn primary" :disabled="saving" @click="onSubmit">
          {{ saving ? 'Menyimpan...' : 'Simpan' }}
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
  width: min(480px, 100%);
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
.sub {
  margin: 0 0 6px;
  font-size: 13px;
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
.row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  min-width: 0;
}
.req {
  text-transform: none;
  letter-spacing: normal;
  color: var(--danger);
}
.opt {
  text-transform: none;
  letter-spacing: normal;
  color: var(--muted);
  font-weight: 400;
}
input,
select {
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
input:focus,
select:focus {
  outline: none;
  border-color: rgba(109, 90, 224, 0.55);
  box-shadow: 0 0 0 4px var(--brand-soft);
  background: var(--card);
}
select {
  cursor: pointer;
}
.hint {
  margin: 6px 0 0;
  font-size: 13px;
  color: var(--muted);
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
@media (max-width: 480px) {
  .row {
    grid-template-columns: 1fr;
  }
  .dialog {
    padding: 20px 18px 18px;
  }
}
</style>
