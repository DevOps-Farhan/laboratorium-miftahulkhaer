import { reactive, ref } from 'vue'
import { ApiError } from '../lib/http'
import { waitMinLoading } from '../lib/min-loading'
import {
  bookSlot,
  cancelSlot,
  createSlot,
  deleteSlot,
  listSlots,
  unbookSlot,
  updateSlot,
  type SlotListFilters,
} from '../lib/slot-api'
import type { CreateSlotPayload, SlotsListResult, UpdateSlotPayload } from '../types/slot'

const SEARCH_DEBOUNCE_MS = 400

function toFriendlyMessage(e: unknown, fallback: string): { message: string; status: number } {
  const status = e instanceof ApiError ? e.status : 0
  const raw = e instanceof Error ? e.message : fallback
  if (status === 401) return { message: 'Sesi berakhir, silakan login ulang.', status }
  if (status === 403) return { message: 'Anda tidak berhak melakukan aksi ini.', status }
  if (status === 400 || status === 404 || status === 409) return { message: raw, status }
  return { message: raw || fallback, status }
}

export interface SlotFilters extends SlotListFilters {
  search: string
}

export function useSlot(opts?: { mine?: boolean; size?: number }) {
  const items = ref<SlotsListResult['data']>([])
  const paging = ref({ page: 1, size: 10, total_item: 0, total_page: 0 })
  const filters = reactive<SlotFilters>({ search: '', mine: opts?.mine })
  const loading = ref(false)
  const errorMsg = ref('')
  const errorStatus = ref(0)

  let searchTimer: ReturnType<typeof setTimeout> | null = null

  async function load(): Promise<void> {
    loading.value = true
    const startedAt = Date.now()
    errorMsg.value = ''
    errorStatus.value = 0
    try {
      const result: SlotsListResult = await listSlots(paging.value.page, filters, opts?.size)
      items.value = result.data
      paging.value = result.paging
    } catch (e) {
      const friendly = toFriendlyMessage(e, 'Gagal memuat slot jadwal')
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

  function setPage(page: number): void {
    if (page < 1 || page > Math.max(paging.value.total_page, 1)) return
    paging.value.page = page
    void load()
  }

  function setSearch(value: string): void {
    filters.search = value
    if (searchTimer) clearTimeout(searchTimer)
    searchTimer = setTimeout(() => {
      paging.value.page = 1
      void load()
    }, SEARCH_DEBOUNCE_MS)
  }

  function setLaboratoriumFilter(value: number | undefined): void {
    filters.laboratoriumId = value
    paging.value.page = 1
    void load()
  }

  function setDate(value: string | undefined): void {
    filters.date = value
    paging.value.page = 1
    void load()
  }

  function resetFilters(): void {
    filters.search = ''
    filters.laboratoriumId = undefined
    paging.value.page = 1
    void load()
  }

  async function saveSlot(
    payload: CreateSlotPayload | UpdateSlotPayload,
    id: number | null,
  ): Promise<void> {
    try {
      if (id === null) {
        await createSlot(payload as CreateSlotPayload)
      } else {
        await updateSlot(id, payload as UpdateSlotPayload)
      }
      await refresh()
    } catch (e) {
      const friendly = toFriendlyMessage(e, 'Gagal menyimpan slot')
      throw new Error(friendly.message)
    }
  }

  async function removeSlot(id: number): Promise<string> {
    try {
      await deleteSlot(id)
      await refresh()
      return 'Slot berhasil dihapus'
    } catch (e) {
      const friendly = toFriendlyMessage(e, 'Gagal menghapus slot')
      throw new Error(friendly.message)
    }
  }

  async function cancelSlotById(id: number): Promise<string> {
    try {
      const message = await cancelSlot(id)
      await refresh()
      return message
    } catch (e) {
      const friendly = toFriendlyMessage(e, 'Gagal membatalkan slot')
      throw new Error(friendly.message)
    }
  }

  async function bookSlotById(id: number, payload?: { catatan?: string }): Promise<void> {
    try {
      await bookSlot(id, payload)
      await refresh()
    } catch (e) {
      const friendly = toFriendlyMessage(e, 'Gagal booking slot')
      const err = new Error(friendly.message) as Error & { status: number }
      err.status = friendly.status
      throw err
    }
  }

  async function unbookSlotById(id: number): Promise<string> {
    try {
      const message = await unbookSlot(id)
      await refresh()
      return message
    } catch (e) {
      const friendly = toFriendlyMessage(e, 'Gagal membatalkan booking')
      throw new Error(friendly.message)
    }
  }

  return {
    items,
    paging,
    filters,
    loading,
    errorMsg,
    errorStatus,
    load,
    refresh,
    setPage,
    setSearch,
    setLaboratoriumFilter,
    setDate,
    resetFilters,
    saveSlot,
    removeSlot,
    cancelSlotById,
    bookSlotById,
    unbookSlotById,
  }
}
