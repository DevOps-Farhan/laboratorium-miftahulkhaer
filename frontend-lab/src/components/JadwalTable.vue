<script setup lang="ts">
import type { JadwalItem, StatusJadwal } from '../types/jadwal'
import { resolveEffectiveStatus } from '../lib/jadwal-status'
import LoadingSpinner from './LoadingSpinner.vue'

defineProps<{ items: JadwalItem[]; loading: boolean; startIndex?: number }>()

function effectiveStatus(item: JadwalItem): StatusJadwal {
  return resolveEffectiveStatus(item)
}

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

function statusClass(status: StatusJadwal): string {
  if (status === 'BELUM_MULAI') return 'pending'
  if (status === 'DALAM_SESI') return 'ok'
  if (status === 'SELESAI') return 'done'
  return 'bad'
}

function statusLabel(status: StatusJadwal): string {
  return status.replace(/_/g, ' ').toLowerCase().replace(/^\w/, (c) => c.toUpperCase())
}
</script>

<template>
  <section class="table-wrap">
    <LoadingSpinner v-if="loading" />
    <p v-else-if="items.length === 0" class="state">Tidak ada jadwal yang cocok.</p>
    <table v-else>
      <thead>
        <tr>
          <th class="num-col">No</th>
          <th>Kegiatan</th>
          <th>Laboratorium</th>
          <th>Pengaju</th>
          <th>Mulai</th>
          <th>Selesai</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, idx) in items" :key="item.id">
          <td class="num-col">{{ (startIndex ?? 0) + idx + 1 }}</td>
          <td class="who">{{ item.kegiatan }}</td>
          <td class="mail">{{ item.laboratorium?.nama ?? `Lab #${item.laboratoriumId}` }}</td>
          <td class="mail">{{ item.user?.name ?? item.user?.email ?? `#${item.userId}` }}</td>
          <td class="mail nowrap">{{ formatDateTime(item.tglmulai) }}</td>
          <td class="mail nowrap">{{ formatDateTime(item.tglselesai) }}</td>
          <td>
            <span class="badge" :class="statusClass(effectiveStatus(item))">
              {{ statusLabel(effectiveStatus(item)) }}
            </span>
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
.badge.done {
  background: var(--field);
  border-color: var(--line);
  color: var(--muted);
}
.badge.bad {
  background: var(--danger-soft);
  border-color: transparent;
  color: var(--danger);
}
</style>
