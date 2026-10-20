<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import LoadingSpinner from '../components/LoadingSpinner.vue'
import PaginationBar from '../components/PaginationBar.vue'
import RutinDialog from '../components/RutinDialog.vue'
import SlotDialog from '../components/SlotDialog.vue'
import SlotTable from '../components/SlotTable.vue'
import { useRutin } from '../composables/useRutin'
import { useToast } from '../composables/useToast'
import { useSlot } from '../composables/useSlot'
import { listAllLabs } from '../lib/laboratorium-api'
import type { CreateRutinPayload, RutinItem, UpdateRutinPayload } from '../types/rutin'
import type { CreateSlotPayload, SlotItem, UpdateSlotPayload } from '../types/slot'
import type { LabItem } from '../types/laboratorium'

const emit = defineEmits<{ sessionExpired: [] }>()

const { notify } = useToast()

const {
  items,
  paging,
  filters,
  loading,
  errorMsg,
  errorStatus,
  refresh,
  setPage,
  setSearch,
  setLaboratoriumFilter,
  resetFilters,
  saveSlot,
  removeSlot,
  cancelSlotById,
  unbookSlotById,
} = useSlot()

const dialogOpen = ref(false)
const editing = ref<SlotItem | null>(null)
const saving = ref(false)
const dialogError = ref('')
const busyId = ref<number | null>(null)

// Jadwal rutin harian (dibuat sekali, berlaku tiap hari).
const {
  items: rutinItems,
  loading: rutinLoading,
  errorMsg: rutinError,
  errorStatus: rutinErrorStatus,
  load: loadRutin,
  saveRutin,
  removeRutin,
  toggleRutin,
} = useRutin()
const dialogRutinOpen = ref(false)
const editingRutin = ref<RutinItem | null>(null)
const savingRutin = ref(false)
const dialogRutinError = ref('')
const busyRutinId = ref<number | null>(null)

const labs = ref<LabItem[]>([])
const optionsLoading = ref(false)

async function loadLabs(): Promise<void> {
  optionsLoading.value = true
  try {
    labs.value = await listAllLabs()
  } catch {
    // Dropdown lab boleh gagal diam-diam; error utama ditangani tabel.
  } finally {
    optionsLoading.value = false
  }
}

onMounted(() => {
  void refresh()
  void loadRutin()
  void loadLabs()
})

watch(errorStatus, (status) => {
  if (status === 401) emit('sessionExpired')
})
watch(rutinErrorStatus, (status) => {
  if (status === 401) emit('sessionExpired')
})

function openCreate() {
  editing.value = null
  dialogError.value = ''
  dialogOpen.value = true
}

function openEdit(item: SlotItem) {
  editing.value = item
  dialogError.value = ''
  dialogOpen.value = true
}

async function onSave(payload: CreateSlotPayload | UpdateSlotPayload) {
  const isEdit = editing.value !== null
  saving.value = true
  dialogError.value = ''
  try {
    await saveSlot(payload, editing.value?.id ?? null)
    dialogOpen.value = false
    notify(isEdit ? 'Slot berhasil diubah' : 'Slot jadwal berhasil dibuat', 'success')
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Gagal menyimpan'
    dialogError.value = message
    notify(message, 'error')
  } finally {
    saving.value = false
  }
}

async function onDelete(item: SlotItem) {
  const ok = window.confirm(`Hapus slot lab ${item.laboratorium?.nama ?? ''} pada ${item.tglmulai}?`)
  if (!ok) return
  busyId.value = item.id
  try {
    const message = await removeSlot(item.id)
    notify(message, 'success')
  } catch (e) {
    notify(e instanceof Error ? e.message : 'Gagal menghapus', 'error')
  } finally {
    busyId.value = null
  }
}

async function onCancel(item: SlotItem) {
  const ok = window.confirm('Batalkan slot ini? Slot tidak akan bisa dibooking guru.')
  if (!ok) return
  busyId.value = item.id
  try {
    const message = await cancelSlotById(item.id)
    notify(message, 'success')
  } catch (e) {
    notify(e instanceof Error ? e.message : 'Gagal membatalkan', 'error')
  } finally {
    busyId.value = null
  }
}

async function onUnbook(item: SlotItem) {
  const ok = window.confirm('Batalkan booking guru untuk slot ini? Slot kembali tersedia.')
  if (!ok) return
  busyId.value = item.id
  try {
    const message = await unbookSlotById(item.id)
    notify(message, 'success')
  } catch (e) {
    notify(e instanceof Error ? e.message : 'Gagal membatalkan booking', 'error')
  } finally {
    busyId.value = null
  }
}

function onLabChange(e: Event) {
  const raw = (e.target as HTMLSelectElement).value
  setLaboratoriumFilter(raw ? Number(raw) : undefined)
}

function openCreateRutin() {
  editingRutin.value = null
  dialogRutinError.value = ''
  dialogRutinOpen.value = true
}

function openEditRutin(item: RutinItem) {
  editingRutin.value = item
  dialogRutinError.value = ''
  dialogRutinOpen.value = true
}

async function onSaveRutin(payload: CreateRutinPayload | UpdateRutinPayload) {
  const isEdit = editingRutin.value !== null
  savingRutin.value = true
  dialogRutinError.value = ''
  try {
    await saveRutin(payload, editingRutin.value?.id ?? null)
    dialogRutinOpen.value = false
    notify(isEdit ? 'Jadwal rutin berhasil diubah' : 'Jadwal rutin berhasil dibuat, slot harian otomatis tersedia', 'success')
    void refresh()
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Gagal menyimpan'
    dialogRutinError.value = message
    notify(message, 'error')
  } finally {
    savingRutin.value = false
  }
}

async function onDeleteRutin(item: RutinItem) {
  const ok = window.confirm(`Hapus rutin ${item.jamMulai}–${item.jamSelesai}? Slot tersedia ke depan ikut terhapus, booking guru tetap jalan.`)
  if (!ok) return
  busyRutinId.value = item.id
  try {
    const message = await removeRutin(item.id)
    notify(message, 'success')
    void refresh()
  } catch (e) {
    notify(e instanceof Error ? e.message : 'Gagal menghapus', 'error')
  } finally {
    busyRutinId.value = null
  }
}

async function onToggleRutin(item: RutinItem) {
  busyRutinId.value = item.id
  try {
    await toggleRutin(item.id, !item.aktif)
    notify(item.aktif ? 'Rutin dinonaktifkan' : 'Rutin diaktifkan kembali', 'success')
    void refresh()
  } catch (e) {
    notify(e instanceof Error ? e.message : 'Gagal mengubah status', 'error')
  } finally {
    busyRutinId.value = null
  }
}

defineExpose({ refresh })
</script>

<template>
  <div class="view">
    <section class="block">
      <div class="blockhead">
        <h3>Jadwal rutin harian</h3>
        <button class="btn primary" @click="openCreateRutin">
          <span aria-hidden="true">+</span> Tambah rutin
        </button>
      </div>
      <p class="hint">Dibuat sekali, berlaku setiap hari. Slot otomatis dibuat 14 hari ke depan.</p>
      <p v-if="rutinError" class="error">{{ rutinError }}</p>
      <LoadingSpinner v-else-if="rutinLoading || busyRutinId !== null" text="Memuat jadwal rutin..." />
      <p v-else-if="rutinItems.length === 0" class="state">Belum ada jadwal rutin.</p>
      <div v-else class="rutins">
        <article v-for="r in rutinItems" :key="r.id" class="rutin" :class="{ off: !r.aktif }">
          <div class="rtime">{{ r.jamMulai }} – {{ r.jamSelesai }}</div>
          <div class="rlab">{{ r.laboratorium?.nama ?? `Lab #${r.laboratoriumId}` }}</div>
          <p v-if="r.catatan" class="rnote">{{ r.catatan }}</p>
          <span class="badge" :class="r.aktif ? 'ok' : 'bad'">{{ r.aktif ? 'Aktif' : 'Nonaktif' }}</span>
          <div class="row-actions">
            <button class="btn small" :disabled="busyRutinId === r.id" @click="openEditRutin(r)">Edit</button>
            <button class="btn small" :disabled="busyRutinId === r.id" @click="onToggleRutin(r)">
              {{ r.aktif ? 'Nonaktifkan' : 'Aktifkan' }}
            </button>
            <button class="btn small danger" :disabled="busyRutinId === r.id" @click="onDeleteRutin(r)">Hapus</button>
          </div>
        </article>
      </div>
      <RutinDialog
        :open="dialogRutinOpen"
        :editing="editingRutin"
        :saving="savingRutin"
        :server-error="dialogRutinError"
        :labs="labs"
        :options-loading="optionsLoading"
        @close="dialogRutinOpen = false"
        @save="onSaveRutin"
      />
    </section>

    <section class="block">
      <h3>Slot (rutin + manual)</h3>
    <section class="filters">
      <div class="search">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true">
          <circle cx="11" cy="11" r="6.4" />
          <path d="m16 16 4 4" />
        </svg>
        <input
          :value="filters.search"
          type="search"
          placeholder="Cari slot..."
          aria-label="Cari slot"
          @input="setSearch(($event.target as HTMLInputElement).value)"
        />
      </div>
      <select :value="filters.laboratoriumId ?? ''" aria-label="Filter laboratorium" @change="onLabChange">
        <option value="">Semua lab</option>
        <option v-for="lab in labs" :key="lab.id" :value="lab.id">
          {{ lab.kode }} — {{ lab.nama }}
        </option>
      </select>
      <button class="btn ghost" @click="resetFilters">Reset</button>
      <button class="btn primary" @click="openCreate">
        <span aria-hidden="true">+</span> Buat slot
      </button>
    </section>
    <p v-if="errorMsg" class="error">{{ errorMsg }}</p>
    <SlotTable
      :items="items"
      :loading="loading || busyId !== null"
      :busy-id="busyId"
      variant="teknisi"
      :start-index="(paging.page - 1) * paging.size"
      empty-text="Belum ada slot. Klik &quot;Buat slot&quot; untuk menentukan jadwal."
      @edit="openEdit"
      @del="onDelete"
      @cancel="onCancel"
      @unbook="onUnbook"
    />
    <PaginationBar
      :page="paging.page"
      :total-page="paging.total_page"
      :total-item="paging.total_item"
      :loading="loading"
      @prev="setPage(paging.page - 1)"
      @next="setPage(paging.page + 1)"
    />
    <SlotDialog
      :open="dialogOpen"
      :editing="editing"
      :saving="saving"
      :server-error="dialogError"
      :labs="labs"
      :options-loading="optionsLoading"
      @close="dialogOpen = false"
      @save="onSave"
    />
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
.blockhead {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
}
.block h3 {
  margin: 0;
  color: var(--ink);
  font-size: 16px;
}
.hint {
  margin: 0;
  font-size: 13px;
  color: var(--muted);
}
.state {
  margin: 0;
  padding: 22px 16px;
  text-align: center;
  font-size: 14px;
  color: var(--muted);
  border: 1px dashed var(--line);
  border-radius: 18px;
}
.rutins {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 12px;
}
.rutin {
  display: grid;
  gap: 4px;
  align-content: start;
  padding: 16px;
  border: 1px solid var(--line);
  border-radius: 18px;
  background: var(--card-soft);
  box-shadow: var(--shadow-1);
}
.rutin.off {
  opacity: 0.65;
}
.rtime {
  font-size: 17px;
  font-weight: 700;
  color: var(--ink);
  font-variant-numeric: tabular-nums;
}
.rlab {
  font-size: 13.5px;
  font-weight: 600;
  color: var(--brand-ink);
}
.rnote {
  margin: 0;
  font-size: 13px;
  color: var(--muted);
}
.badge {
  justify-self: start;
  display: inline-flex;
  align-items: center;
  padding: 3px 11px;
  border-radius: 999px;
  font-size: 12.5px;
  font-weight: 600;
  white-space: nowrap;
  margin: 4px 0;
}
.badge.ok {
  background: rgba(34, 197, 94, 0.14);
  color: #16a34a;
}
.badge.bad {
  background: var(--danger-soft);
  color: var(--danger);
}
.row-actions {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 6px;
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
}
.btn.small:disabled {
  opacity: 0.55;
  cursor: wait;
}
.btn.small.danger {
  color: var(--danger);
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
.filters {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
  padding: 12px;
  border: 1px solid var(--line);
  border-radius: 18px;
  background: var(--card-soft);
  box-shadow: var(--shadow-1);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}
.search {
  position: relative;
  display: flex;
  align-items: center;
  flex: 2 1 220px;
  min-width: 0;
}
.search svg {
  position: absolute;
  left: 12px;
  width: 17px;
  height: 17px;
  color: var(--muted);
  pointer-events: none;
}
.search input {
  width: 100%;
  min-width: 0;
  padding: 10px 12px 10px 38px;
}
input,
select {
  box-sizing: border-box;
  padding: 10px 12px;
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  background: var(--field);
  color: var(--ink);
  font-family: inherit;
  font-size: 14px;
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
input::-webkit-search-cancel-button {
  cursor: pointer;
}
select {
  flex: 1 1 160px;
  min-width: 0;
  cursor: pointer;
}
.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  border-radius: var(--r-md);
  font-family: inherit;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  width: auto;
  transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease,
    border-color 0.18s ease, color 0.18s ease;
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
.btn.ghost:hover {
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
.btn.primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 18px 26px -16px rgba(109, 90, 224, 0.95);
}
.btn.primary span {
  font-size: 16px;
  line-height: 1;
}
</style>
