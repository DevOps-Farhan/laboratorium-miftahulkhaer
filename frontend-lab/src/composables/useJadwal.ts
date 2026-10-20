import { reactive, ref } from 'vue'
import { ApiError } from '../lib/http'
import { waitMinLoading } from '../lib/min-loading'
import { cancelJadwal, createJadwal, listJadwals, undoCancelJadwal, updateJadwal } from '../lib/jadwal-api'
import type {
  CreateJadwalPayload,
  JadwalFilters,
  JadwalsListResult,
  StatusJadwal,
  UpdateJadwalPayload,
} from '../types/jadwal'

const SEARCH_DEBOUNCE_MS = 400

function toFriendlyMessage(e: unknown, fallback: string): { message: string; status: number } {
  const status = e instanceof ApiError ? e.status : 0
  const raw = e instanceof Error ? e.message : fallback
  if (status === 401) return { message: 'Sesi berakhir, silakan login ulang.', status }
  if (status === 403) return { message: 'Hanya teknisi yang boleh melihat jadwal.', status }
  if (status === 400) return { message: raw, status }
  return { message: raw || fallback, status }
}

export function useJadwal() {
  const items = ref<JadwalsListResult['data']>([])
  const paging = ref({ page: 1, size: 10, total_item: 0, total_page: 0 })
  const filters = reactive<JadwalFilters>({ search: '' })
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
      const result: JadwalsListResult = await listJadwals(paging.value.page, filters)
      items.value = result.data
      paging.value = result.paging
    } catch (e) {
      const friendly = toFriendlyMessage(e, 'Gagal memuat jadwal')
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

  function setStatus(value: StatusJadwal | undefined): void {
    filters.status = value
    paging.value.page = 1
    void load()
  }

  function setLaboratoriumFilter(value: number | undefined): void {
    filters.laboratoriumId = value
    paging.value.page = 1
    void load()
  }

  async function saveJadwal(
    payload: CreateJadwalPayload | UpdateJadwalPayload,
    id: number | null,
  ): Promise<void> {
    try {
      if (id === null) {
        await createJadwal(payload as CreateJadwalPayload)
      } else {
        await updateJadwal(id, payload as UpdateJadwalPayload)
      }
      await refresh()
    } catch (e) {
      const friendly = toFriendlyMessage(e, 'Gagal menyimpan pengajuan')
      throw new Error(friendly.message)
    }
  }

  async function cancelPengajuan(id: number): Promise<string> {
    try {
      const message = await cancelJadwal(id)
      await refresh()
      return message
    } catch (e) {
      const friendly = toFriendlyMessage(e, 'Gagal membatalkan pengajuan')
      throw new Error(friendly.message)
    }
  }

  async function undoCancelPengajuan(id: number): Promise<string> {
    try {
      const message = await undoCancelJadwal(id)
      await refresh()
      return message
    } catch (e) {
      const friendly = toFriendlyMessage(e, 'Gagal mengaktifkan pengajuan')
      throw new Error(friendly.message)
    }
  }

  function resetFilters(): void {
    filters.search = ''
    filters.status = undefined
    filters.laboratoriumId = undefined
    paging.value.page = 1
    void load()
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
    setStatus,
    setLaboratoriumFilter,
    resetFilters,
    saveJadwal,
    cancelPengajuan,
    undoCancelPengajuan,
  }
}
