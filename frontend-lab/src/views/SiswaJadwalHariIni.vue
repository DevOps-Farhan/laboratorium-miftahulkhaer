<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import LoadingSpinner from '../components/LoadingSpinner.vue'
import { waitMinLoading } from '../lib/min-loading'
import { ApiError } from '../lib/http'
import { listJadwals } from '../lib/jadwal-api'
import { listSlots } from '../lib/slot-api'
import { formatDayLong, formatTime, todayKey } from '../lib/slot-dates'
import type { JadwalItem } from '../types/jadwal'
import type { SlotItem } from '../types/slot'

const emit = defineEmits<{ sessionExpired: [] }>()

const today = todayKey()

const slots = ref<SlotItem[]>([])
const jadwals = ref<JadwalItem[]>([])
const loading = ref(false)
const errorMsg = ref('')
const errorStatus = ref(0)

function toFriendlyMessage(e: unknown, fallback: string): { message: string; status: number } {
  const status = e instanceof ApiError ? e.status : 0
  const raw = e instanceof Error ? e.message : fallback
  if (status === 401) return { message: 'Sesi berakhir, silakan login ulang.', status }
  if (status === 403) return { message: 'Anda tidak berhak melihat jadwal.', status }
  return { message: raw || fallback, status }
}

function formatRange(mulai: string, selesai: string): string {
  return `${formatTime(mulai)} – ${formatTime(selesai)}`
}

async function load(): Promise<void> {
  loading.value = true
  const startedAt = Date.now()
  errorMsg.value = ''
  errorStatus.value = 0
  try {
    const [slotRes, jadwalRes] = await Promise.all([
      listSlots(1, { date: today, status: 'DIBOOKING' }, 100),
      listJadwals(1, { search: '' }),
    ])
    slots.value = slotRes.data
    jadwals.value = jadwalRes.data
  } catch (e) {
    const friendly = toFriendlyMessage(e, 'Gagal memuat jadwal hari ini')
    errorMsg.value = friendly.message
    errorStatus.value = friendly.status
  } finally {
    await waitMinLoading(startedAt)
    loading.value = false
  }
}

async function refresh(): Promise<void> {
  await load()
}

onMounted(() => {
  void load()
})

watch(errorStatus, (status) => {
  if (status === 401) emit('sessionExpired')
})

defineExpose({ refresh })
</script>

<template>
  <div class="view">
    <p class="picked">{{ formatDayLong(today) }}</p>
    <p v-if="errorMsg" class="error">{{ errorMsg }}</p>

    <section class="block">
      <h3>Booking slot hari ini</h3>
      <div class="table-wrap">
        <LoadingSpinner v-if="loading" />
        <p v-else-if="slots.length === 0" class="state">Belum ada lab yang dibooking hari ini.</p>
        <table v-else>
          <thead>
            <tr>
              <th class="num-col">No</th>
              <th>Jam</th>
              <th>Laboratorium</th>
              <th>Catatan</th>
              <th>Guru Pengajar</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, idx) in slots" :key="item.id">
              <td class="num-col">{{ idx + 1 }}</td>
              <td class="nowrap">{{ formatRange(item.tglmulai, item.tglselesai) }}</td>
              <td>{{ item.laboratorium?.nama ?? `Lab #${item.laboratoriumId}` }}</td>
              <td>{{ item.catatan || '—' }}</td>
              <td>
                <div class="who">{{ item.bookedBy?.name ?? '—' }}</div>
                <div class="mail">{{ item.bookedBy?.email ?? '—' }}</div>
              </td>
              <td><span class="badge pending">Dibooking</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section class="block">
      <h3>Jadwal yang dibooking hari ini</h3>
      <div class="table-wrap">
        <LoadingSpinner v-if="loading" />
        <p v-else-if="jadwals.length === 0" class="state">Belum ada jadwal yang dibooking hari ini.</p>
        <table v-else>
          <thead>
            <tr>
              <th class="num-col">No</th>
              <th>Jam</th>
              <th>Laboratorium</th>
              <th>Kegiatan</th>
              <th>Guru Pengajar</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, idx) in jadwals" :key="item.id">
              <td class="num-col">{{ idx + 1 }}</td>
              <td class="nowrap">{{ formatRange(item.tglmulai, item.tglselesai) }}</td>
              <td>{{ item.laboratorium?.nama ?? `Lab #${item.laboratoriumId}` }}</td>
              <td>{{ item.kegiatan }}</td>
              <td>
                <div class="who">{{ item.user?.name ?? '—' }}</div>
                <div class="mail">{{ item.user?.email ?? '—' }}</div>
              </td>
              <td><span class="badge" :class="item.status === 'BATAL' ? 'bad' : 'ok'">{{ item.status }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<style scoped>
.view {
  display: grid;
  gap: 22px;
  align-content: start;
}
.block {
  display: grid;
  gap: 12px;
  align-content: start;
}
.block h3 {
  margin: 0;
  color: var(--ink);
  font-size: 16px;
}
.picked {
  margin: 0;
  font-size: 13.5px;
  font-weight: 600;
  color: var(--brand-ink);
}
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
.error {
  margin: 0;
  padding: 12px 15px;
  border: 1px solid var(--danger-soft);
  border-radius: var(--r-md);
  background: var(--danger-soft);
  color: var(--danger);
  font-size: 14px;
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
.nowrap {
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
</style>
