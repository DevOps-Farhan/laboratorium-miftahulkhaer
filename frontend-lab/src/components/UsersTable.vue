<script setup lang="ts">
import type { ManagedUser } from '../types/user'
import LoadingSpinner from './LoadingSpinner.vue'

withDefaults(
  defineProps<{ items: ManagedUser[]; loading: boolean; currentUserEmail?: string; startIndex?: number }>(),
  { startIndex: 0 },
)

const emit = defineEmits<{
  edit: [user: ManagedUser]
  toggleStatus: [user: ManagedUser]
  remove: [user: ManagedUser]
}>()
</script>

<template>
  <section class="table-wrap">
    <LoadingSpinner v-if="loading" />
    <p v-else-if="items.length === 0" class="state">Tidak ada user yang cocok dengan filter.</p>
    <table v-else>
      <thead>
        <tr>
          <th class="num-col">No</th>
          <th>Nama</th>
          <th>Email</th>
          <th>Role</th>
          <th>Status</th>
          <th>Aksi</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(u, idx) in items" :key="u.id">
          <td class="num-col">{{ (startIndex ?? 0) + idx + 1 }}</td>
          <td class="who">{{ u.name ?? '-' }}</td>
          <td class="mail">{{ u.email }}</td>
          <td><span class="badge role">{{ u.role }}</span></td>
          <td>
            <span class="badge" :class="u.status === 'aktif' ? 'ok' : 'off'">
              <span class="pip" aria-hidden="true"></span>
              {{ u.status }}
            </span>
          </td>
          <td class="row-actions">
            <button class="btn small" @click="emit('edit', u)">Edit</button>
            <button
              class="btn small"
              :class="u.status === 'aktif' ? 'suspend' : 'activate'"
              @click="emit('toggleStatus', u)"
            >
              {{ u.status === 'aktif' ? 'Nonaktifkan' : 'Aktifkan' }}
            </button>
            <button
              class="btn small danger"
              :disabled="u.email === currentUserEmail"
              :title="u.email === currentUserEmail ? 'Tidak bisa menghapus akun sendiri' : 'Hapus user'"
              @click="emit('remove', u)"
            >
              Hapus
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </section>
</template>

<style scoped>
.table-wrap {
  overflow-x: auto;
  border: 1px solid var(--line);
  border-radius: 18px;
  background: var(--card-soft);
  box-shadow: var(--shadow-1);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.state {
  margin: 0;
  padding: 34px 20px;
  text-align: center;
  font-size: 14.5px;
  color: var(--muted);
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

th,
td {
  text-align: left;
  padding: 12px 16px;
  border-bottom: 1px solid var(--line);
  vertical-align: middle;
}
thead th {
  background: rgba(109, 90, 224, 0.06);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--muted);
  white-space: nowrap;
}
@media (prefers-color-scheme: dark) {
  thead th {
    background: rgba(139, 124, 246, 0.12);
  }
}
tbody tr:last-child td {
  border-bottom: 0;
}
tbody tr {
  transition: background 0.16s ease;
}
tbody tr:hover {
  background: var(--brand-soft);
}

.num-col {
  font-variant-numeric: tabular-nums;
  color: var(--muted);
  width: 1%;
  white-space: nowrap;
}
.who {
  font-weight: 600;
  color: var(--ink);
  white-space: nowrap;
}
.mail {
  color: var(--muted);
  max-width: 260px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 11px;
  border-radius: 999px;
  font-size: 12.5px;
  font-weight: 600;
  text-transform: capitalize;
  white-space: nowrap;
  background: var(--field);
  border: 1px solid var(--line);
  color: var(--muted);
}
.badge.role {
  background: var(--brand-soft);
  border-color: transparent;
  color: var(--brand-ink);
}
.badge.ok {
  background: var(--ok-soft);
  border-color: transparent;
  color: var(--ok);
}
.badge.off {
  background: var(--danger-soft);
  border-color: transparent;
  color: var(--danger);
}
.pip {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

.row-actions {
  display: flex;
  gap: 6px;
  white-space: nowrap;
}

.btn.small {
  padding: 6px 11px;
  border-radius: var(--r-sm);
  border: 1px solid var(--line);
  background: var(--card);
  color: var(--ink);
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  width: auto;
  transition: background 0.16s ease, border-color 0.16s ease, color 0.16s ease,
    transform 0.16s ease;
}
.btn.small:hover {
  transform: translateY(-1px);
  border-color: rgba(109, 90, 224, 0.45);
  background: var(--brand-soft);
  color: var(--brand-ink);
}
.btn.small:focus-visible {
  outline: 2px solid var(--brand);
  outline-offset: 2px;
}
.btn.small.suspend {
  color: var(--danger);
}
.btn.small.suspend:hover {
  background: var(--danger-soft);
  border-color: var(--danger-soft);
  color: var(--danger);
}
.btn.small.danger {
  color: var(--danger);
  border-color: var(--danger-soft);
}
.btn.small.danger:hover:not(:disabled) {
  background: var(--danger);
  border-color: var(--danger);
  color: #fff;
}
.btn.small:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.btn.small:disabled:hover {
  transform: none;
}
.btn.small.activate {
  color: var(--ok);
}
.btn.small.activate:hover {
  background: var(--ok-soft);
  border-color: var(--ok-soft);
  color: var(--ok);
}
</style>
