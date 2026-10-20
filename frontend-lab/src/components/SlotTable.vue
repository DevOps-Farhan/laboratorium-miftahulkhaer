<script setup lang="ts">
import type { SlotItem, StatusSlot } from '../types/slot'
import LoadingSpinner from './LoadingSpinner.vue'

withDefaults(
  defineProps<{
    items: SlotItem[]
    loading: boolean
    busyId: number | null
    startIndex?: number
    variant?: 'teknisi' | 'tersedia' | 'booking'
    emptyText?: string
  }>(),
  { startIndex: 0, variant: 'teknisi' },
)

const emit = defineEmits<{
  edit: [item: SlotItem]
  del: [item: SlotItem]
  cancel: [item: SlotItem]
  book: [item: SlotItem]
  unbook: [item: SlotItem]
}>()

function formatDateTime(value: string): string {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function statusClass(status: StatusSlot): string {
  if (status === 'TERSEDIA') return 'ok'
  if (status === 'DIBOOKING') return 'pending'
  return 'bad'
}

function statusLabel(status: StatusSlot): string {
  if (status === 'TERSEDIA') return 'Tersedia'
  if (status === 'DIBOOKING') return 'Dibooking'
  return 'Batal'
}
</script>

<template>
  <section class="table-wrap">
    <LoadingSpinner v-if="loading" />
    <p v-else-if="items.length === 0" class="state">{{ emptyText ?? 'Belum ada slot jadwal.' }}</p>
    <table v-else>
      <thead>
        <tr>
          <th class="num-col">No</th>
          <th>Laboratorium</th>
          <th>Mulai</th>
          <th>Selesai</th>
          <th>Catatan</th>
          <th v-if="variant !== 'tersedia'">Status</th>
          <th>Aksi</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, idx) in items" :key="item.id">
          <td class="num-col">{{ (startIndex ?? 0) + idx + 1 }}</td>
          <td class="mail">{{ item.laboratorium?.nama ?? `Lab #${item.laboratoriumId}` }}</td>
          <td class="mail nowrap">{{ formatDateTime(item.tglmulai) }}</td>
          <td class="mail nowrap">{{ formatDateTime(item.tglselesai) }}</td>
          <td class="who">{{ item.catatan || '—' }}</td>
          <td v-if="variant !== 'tersedia'">
            <span class="badge" :class="statusClass(item.status)">
              {{ statusLabel(item.status) }}
            </span>
          </td>
          <td class="row-actions">
            <template v-if="variant === 'teknisi'">
              <button
                v-if="item.status === 'TERSEDIA'"
                class="btn small"
                :disabled="busyId === item.id"
                @click="emit('edit', item)"
              >
                Edit
              </button>
              <button
                v-if="item.status === 'TERSEDIA'"
                class="btn small suspend"
                :disabled="busyId === item.id"
                @click="emit('cancel', item)"
              >
                {{ busyId === item.id ? '...' : 'Batalkan' }}
              </button>
              <button
                v-if="item.status !== 'DIBOOKING'"
                class="btn small danger"
                :disabled="busyId === item.id"
                @click="emit('del', item)"
              >
                {{ busyId === item.id ? '...' : 'Hapus' }}
              </button>
              <button
                v-if="item.status === 'DIBOOKING'"
                class="btn small suspend"
                :disabled="busyId === item.id"
                @click="emit('unbook', item)"
              >
                {{ busyId === item.id ? '...' : 'Batalkan booking' }}
              </button>
            </template>
            <template v-else-if="variant === 'tersedia'">
              <button
                class="btn small primary"
                :disabled="busyId === item.id"
                @click="emit('book', item)"
              >
                {{ busyId === item.id ? '...' : 'Booking' }}
              </button>
            </template>
            <template v-else>
              <button
                class="btn small suspend"
                :disabled="busyId === item.id"
                @click="emit('unbook', item)"
              >
                {{ busyId === item.id ? '...' : 'Batalkan' }}
              </button>
            </template>
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
  white-space: nowrap;
}
.nowrap {
  white-space: nowrap;
}
.badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 11px;
  border-radius: 999px;
  font-size: 12.5px;
  font-weight: 600;
  white-space: nowrap;
  background: var(--field);
  border: 1px solid var(--line);
  color: var(--muted);
}
.badge.pending {
  background: var(--brand-soft);
  border-color: transparent;
  color: var(--brand-ink);
}
.badge.ok {
  background: rgba(34, 197, 94, 0.14);
  border-color: transparent;
  color: #16a34a;
}
.badge.bad {
  background: var(--danger-soft);
  border-color: transparent;
  color: var(--danger);
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
.btn.small:hover:not(:disabled) {
  transform: translateY(-1px);
  border-color: rgba(109, 90, 224, 0.45);
  background: var(--brand-soft);
  color: var(--brand-ink);
}
.btn.small:focus-visible {
  outline: 2px solid var(--brand);
  outline-offset: 2px;
}
.btn.small:disabled {
  opacity: 0.55;
  cursor: wait;
}
.btn.small.suspend {
  color: var(--danger);
}
.btn.small.suspend:hover:not(:disabled) {
  background: var(--danger-soft);
  border-color: var(--danger-soft);
  color: var(--danger);
}
.btn.small.danger {
  color: var(--danger);
}
.btn.small.primary {
  background: linear-gradient(135deg, var(--brand-2), var(--brand));
  border: 1px solid transparent;
  color: #fff;
}
</style>
