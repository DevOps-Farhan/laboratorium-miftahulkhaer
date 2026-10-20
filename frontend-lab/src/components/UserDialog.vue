<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { isValidEmail } from '../lib/validators'
import type { CreateUserPayload, ManagedUser, Role, Status } from '../types/user'

const props = defineProps<{
  open: boolean
  editing: ManagedUser | null
  saving: boolean
  serverError: string
}>()

const emit = defineEmits<{
  close: []
  save: [payload: CreateUserPayload | { email?: string; name?: string; role?: Role; status?: Status; password?: string }]
}>()

const form = reactive({
  email: '',
  name: '',
  role: 'siswa' as Role,
  status: 'aktif' as Status,
  password: '',
})
const formError = ref('')

watch(
  () => [props.open, props.editing],
  () => {
    form.email = props.editing?.email ?? ''
    form.name = props.editing?.name ?? ''
    form.role = props.editing?.role ?? 'siswa'
    form.status = props.editing?.status ?? 'aktif'
    form.password = ''
    formError.value = ''
  },
  { immediate: true },
)

function onSubmit() {
  if (!isValidEmail(form.email.trim())) {
    formError.value = 'Format email tidak valid'
    return
  }
  if (!props.editing && form.password.length < 8) {
    formError.value = 'Password minimal 8 karakter'
    return
  }
  if (props.editing && form.password && form.password.length < 8) {
    formError.value = 'Password baru minimal 8 karakter'
    return
  }
  formError.value = ''
  if (props.editing) {
    const payload: { email?: string; name?: string; role?: Role; status?: Status; password?: string } = {
      email: form.email.trim(),
      name: form.name.trim() || undefined,
      role: form.role,
      status: form.status,
    }
    // Password baru hanya dikirim jika diisi (kosong = tidak diubah).
    if (form.password) payload.password = form.password
    emit('save', payload)
  } else {
    emit('save', {
      email: form.email.trim(),
      name: form.name.trim() || undefined,
      role: form.role,
      status: form.status,
      password: form.password,
    })
  }
}
</script>

<template>
  <div v-if="open" class="overlay" @click.self="emit('close')">
    <section class="dialog">
      <h2>{{ editing ? `Edit user #${editing.id}` : 'Tambah user' }}</h2>
      <label>
        Email
        <input v-model="form.email" type="email" placeholder="nama@example.com" />
      </label>
      <label>
        Nama
        <input v-model="form.name" type="text" placeholder="Nama (opsional)" maxlength="100" />
      </label>
      <div class="grid">
        <label>
          Role
          <select v-model="form.role">
            <option value="teknisi">Teknisi</option>
            <option value="guru">Guru</option>
            <option value="siswa">Siswa</option>
          </select>
        </label>
        <label>
          Status
          <select v-model="form.status">
            <option value="aktif">Aktif</option>
            <option value="nonaktif">Nonaktif</option>
          </select>
        </label>
      </div>
      <label>
        {{ editing ? 'Password baru' : 'Password' }}
        <span v-if="editing" class="opt">(opsional — kosongkan jika tidak diubah)</span>
        <input v-model="form.password" type="password" placeholder="min. 8 karakter" autocomplete="new-password" />
      </label>
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
  background: rgba(22, 18, 44, 0.42);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  animation: fade 0.2s ease both;
}
.dialog {
  width: min(460px, 100%);
  max-height: calc(100vh - 40px);
  overflow-y: auto;
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
  font-size: 11.5px;
  font-weight: 600;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: var(--muted);
}
input,
select {
  box-sizing: border-box;
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
.opt {
  text-transform: none;
  letter-spacing: normal;
  color: var(--muted);
  font-weight: 400;
}input:focus,
select:focus {
  outline: none;
  border-color: rgba(109, 90, 224, 0.55);
  box-shadow: 0 0 0 4px var(--brand-soft);
  background: var(--card);
}
.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
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
