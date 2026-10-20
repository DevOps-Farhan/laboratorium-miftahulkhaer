<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import BookingDialog from '../components/BookingDialog.vue'
import LoadingSpinner from '../components/LoadingSpinner.vue'
import SlotCard from '../components/SlotCard.vue'
import SlotDateStrip from '../components/SlotDateStrip.vue'
import SlotTable from '../components/SlotTable.vue'
import { useToast } from '../composables/useToast'
import { useSlot } from '../composables/useSlot'
import { formatDayLong, todayKey } from '../lib/slot-dates'
import type { SlotItem } from '../types/slot'

const emit = defineEmits<{ sessionExpired: [] }>()

const { notify } = useToast()

const selectedDate = ref(todayKey())
const selectedLabId = ref<number | undefined>(undefined)

// Slot yang bisa direbut guru (per tanggal, lalu per lab).
const {
  items: availItems,
  loading: availLoading,
  errorMsg: availError,
  errorStatus: availErrorStatus,
  refresh: availRefresh,
  setDate: availSetDate,
  bookSlotById,
} = useSlot({ size: 100 })
// Booking milik guru tersebut (yang sudah selesai disembunyikan di bawah).
const {
  items: mineItems,
  loading: mineLoading,
  errorMsg: mineError,
  errorStatus: mineErrorStatus,
  refresh: mineRefresh,
  unbookSlotById,
} = useSlot({ mine: true, size: 100 })

const busyId = ref<number | null>(null)

// Modal booking: guru mengisi kelas (opsional) sebelum konfirmasi.
const dialogOpen = ref(false)
const bookingItem = ref<SlotItem | null>(null)
const bookingSaving = ref(false)
const bookingError = ref('')

// Lab yang punya slot pada tanggal terpilih (urutan abjad).
const dateLabs = computed(() => {
  const map = new Map<number, string>()
  for (const s of availItems.value) {
    if (!map.has(s.laboratoriumId)) {
      map.set(s.laboratoriumId, s.laboratorium?.nama ?? `Lab #${s.laboratoriumId}`)
    }
  }
  return [...map.entries()]
    .map(([id, nama]) => ({ id, nama }))
    .sort((a, b) => a.nama.localeCompare(b.nama))
})

const labCards = computed(() =>
  availItems.value
    .filter((s) => selectedLabId.value === undefined || s.laboratoriumId === selectedLabId.value)
    .slice()
    .sort((a, b) => +new Date(a.tglmulai) - +new Date(b.tglmulai)),
)

// Booking yang sudah selesai (tglselesai < sekarang) jangan ditampilkan.
const mineUpcoming = computed(() => {
  const now = Date.now()
  return mineItems.value
    .filter((s) => {
      const end = new Date(s.tglselesai).getTime()
      return Number.isNaN(end) || end >= now
    })
    .slice()
    .sort((a, b) => +new Date(a.tglmulai) - +new Date(b.tglmulai))
})

function pickLab(id: number | undefined): void {
  selectedLabId.value = id
}

function onDateChange(date: string): void {
  selectedDate.value = date
  selectedLabId.value = undefined
  availSetDate(date)
}

async function refreshAll(): Promise<void> {
  await Promise.all([availRefresh(), mineRefresh()])
}

onMounted(() => {
  availSetDate(selectedDate.value)
  void mineRefresh()
})

watch(availErrorStatus, (status) => {
  if (status === 401) emit('sessionExpired')
})
watch(mineErrorStatus, (status) => {
  if (status === 401) emit('sessionExpired')
})

function onBook(item: SlotItem) {
  bookingItem.value = item
  bookingError.value = ''
  dialogOpen.value = true
}

async function onConfirmBooking(kelas: string) {
  if (!bookingItem.value) return
  const item = bookingItem.value
  bookingSaving.value = true
  bookingError.value = ''
  busyId.value = item.id
  try {
    await bookSlotById(item.id, kelas ? { catatan: kelas } : undefined)
    dialogOpen.value = false
    bookingItem.value = null
    notify('Slot berhasil dibooking', 'success')
    void mineRefresh()
    void availRefresh()
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Gagal booking slot'
    bookingError.value = message
    notify(message, 'error')
    // Slot mungkin sudah direbut guru lain — segarkan agar hilang dari daftar.
    void availRefresh()
  } finally {
    bookingSaving.value = false
    busyId.value = null
  }
}

async function onUnbook(item: SlotItem) {
  const ok = window.confirm('Batalkan booking slot ini? Slot akan kembali tersedia.')
  if (!ok) return
  busyId.value = item.id
  try {
    const message = await unbookSlotById(item.id)
    notify(message, 'success')
    void availRefresh()
  } catch (e) {
    notify(e instanceof Error ? e.message : 'Gagal membatalkan', 'error')
  } finally {
    busyId.value = null
  }
}

defineExpose({ refresh: refreshAll })
</script>

<template>
  <div class="view">
    <section class="block">
      <h3>Slot tersedia</h3>
      <SlotDateStrip :model-value="selectedDate" @update:model-value="onDateChange" />
      <p class="picked">{{ formatDayLong(selectedDate) }}</p>

      <div v-if="!availLoading && !availError" class="labs" role="listbox" aria-label="Pilih laboratorium">
        <button
          v-for="lab in dateLabs"
          :key="lab.id"
          class="chip"
          :class="{ active: selectedLabId === lab.id }"
          :aria-selected="selectedLabId === lab.id"
          @click="pickLab(selectedLabId === lab.id ? undefined : lab.id)"
        >
          {{ lab.nama }}
        </button>
        <span v-if="dateLabs.length === 0" class="nolab">Tidak ada slot pada tanggal ini.</span>
      </div>

      <p v-if="availError" class="error">{{ availError }}</p>
      <LoadingSpinner v-else-if="availLoading" text="Memuat slot..." />
      <div v-else-if="labCards.length > 0" class="cards">
        <SlotCard
          v-for="slot in labCards"
          :key="slot.id"
          :item="slot"
          :busy="busyId === slot.id"
          @book="onBook"
        />
      </div>
      <p v-else-if="dateLabs.length === 0" class="state">Tidak ada slot pada tanggal ini.</p>
      <BookingDialog
        :open="dialogOpen"
        :item="bookingItem"
        :saving="bookingSaving"
        :server-error="bookingError"
        @close="dialogOpen = false"
        @confirm="onConfirmBooking"
      />
    </section>

    <section class="block">
      <h3>Booking saya</h3>
      <p v-if="mineError" class="error">{{ mineError }}</p>
      <p v-else-if="!mineLoading" class="count">{{ mineUpcoming.length }} booking mendatang</p>
      <SlotTable
        :items="mineUpcoming"
        :loading="mineLoading || busyId !== null"
        :busy-id="busyId"
        variant="booking"
        :start-index="0"
        empty-text="Tidak ada booking mendatang. Rebut slot tersedia di atas."
        @unbook="onUnbook"
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
.count {
  margin: 0;
  font-size: 13px;
  color: var(--muted);
}
.labs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.chip {
  padding: 9px 16px;
  border-radius: 999px;
  border: 1px solid var(--line);
  background: var(--card);
  color: var(--ink);
  font-family: inherit;
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.16s ease, border-color 0.16s ease, color 0.16s ease;
}
.chip:hover {
  border-color: rgba(109, 90, 224, 0.45);
  background: var(--brand-soft);
}
.chip.active {
  background: linear-gradient(135deg, var(--brand-2), var(--brand));
  border-color: transparent;
  color: #fff;
}
.nolab {
  font-size: 13.5px;
  color: var(--muted);
}
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
  gap: 12px;
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
.error {
  margin: 0;
  padding: 12px 15px;
  border: 1px solid var(--danger-soft);
  border-radius: var(--r-md);
  background: var(--danger-soft);
  color: var(--danger);
  font-size: 14px;
}
</style>
