<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { validateJadwalForm } from '../lib/validators'
import type {
  CreateJadwalPayload,
  JadwalItem,
  UpdateJadwalPayload,
} from '../types/jadwal'
import type { LabItem } from '../types/laboratorium'

const props = defineProps<{
  open: boolean
  editing: JadwalItem | null
  saving: boolean
  serverError: string
  labs: LabItem[]
  optionsLoading: boolean
}>()

const emit = defineEmits<{
  close: []
  save: [payload: CreateJadwalPayload | UpdateJadwalPayload]
}>()

const form = reactive({
  kegiatan: '',
  tglmulai: '',
  tglselesai: '',
  laboratoriumId: null as number | null,
})
const formError = ref('')

function toDateTimeLocal(value: string | undefined): string {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

watch(
  () => [props.open, props.editing],
  () => {
    form.kegiatan = props.editing?.kegiatan ?? ''
    form.tglmulai = toDateTimeLocal(props.editing?.tglmulai)
    form.tglselesai = toDateTimeLocal(props.editing?.tglselesai)
    form.laboratoriumId = props.editing?.laboratoriumId ?? null
    formError.value = ''
  },
  { immediate: true },
)

function onSubmit() {
  const err = validateJadwalForm(form.kegiatan, form.tglmulai, form.tglselesai, form.laboratoriumId)
  if (err) {
    formError.value = err
    return
  }
  formError.value = ''
  emit('save', {
    kegiatan: form.kegiatan.trim(),
    tglmulai: form.tglmulai,
    tglselesai: form.tglselesai,
    laboratoriumId: form.laboratoriumId!,
  })
}
</script>

<template>
  <div v-if="open" class="overlay" @click.self="emit('close')">
    <section class="dialog">
      <h2>{{ editing ? `Edit pengajuan #${editing.id}` : 'Ajukan pemakaian lab' }}</h2>
      <label>
        Kegiatan
        <input v-model="form.kegiatan" type="text" placeholder="Praktikum Jaringan Komputer" />
      </label>
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
          Waktu mulai
          <input v-model="form.tglmulai" type="datetime-local" />
        </label>
        <label>
          Waktu selesai
          <input v-model="form.tglselesai" type="datetime-local" />
        </label>
      </div>
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
  margin: 0 0 10px;
  color: var(--ink);
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
