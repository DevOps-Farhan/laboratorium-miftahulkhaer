import { reactive, ref } from 'vue'
import { ApiError } from '../lib/http'
import { waitMinLoading } from '../lib/min-loading'
import { createLab, deleteLab, listLabs, updateLab } from '../lib/laboratorium-api'
import type {
  CreateLabPayload,
  LabFilters,
  LabItem,
  LabsListResult,
  UpdateLabPayload,
} from '../types/laboratorium'

const SEARCH_DEBOUNCE_MS = 400

function toFriendlyMessage(e: unknown, fallback: string): { message: string; status: number } {
  const status = e instanceof ApiError ? e.status : 0
  const raw = e instanceof Error ? e.message : fallback
  if (status === 401) return { message: 'Sesi berakhir, silakan login ulang.', status }
  if (status === 403) return { message: 'Hanya teknisi yang boleh mengelola laboratorium.', status }
  if (status === 404) return { message: 'Laboratorium tidak ditemukan (mungkin sudah dihapus).', status }
  if (status === 409) return { message: raw, status }
  // Backend me-return 500 untuk validasi gagal maupun konflik rename kode.
  if (status === 500) return { message: 'Data tidak valid atau kode sudah dipakai.', status }
  return { message: raw || fallback, status }
}

export function useLaboratorium() {
  const items = ref<LabItem[]>([])
  const paging = ref({ page: 1, size: 10, total_item: 0, total_page: 0 })
  const filters = reactive<LabFilters>({ search: '' })
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
      const result: LabsListResult = await listLabs(paging.value.page, filters)
      items.value = result.data
      paging.value = result.paging
    } catch (e) {
      const friendly = toFriendlyMessage(e, 'Gagal memuat laboratorium')
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

  function resetFilters(): void {
    filters.search = ''
    paging.value.page = 1
    void load()
  }

  async function saveLab(payload: CreateLabPayload | UpdateLabPayload, id: number | null): Promise<void> {
    try {
      if (id === null) {
        await createLab(payload as CreateLabPayload)
      } else {
        await updateLab(id, payload as UpdateLabPayload)
      }
      await refresh()
    } catch (e) {
      const friendly = toFriendlyMessage(e, 'Gagal menyimpan laboratorium')
      throw new Error(friendly.message)
    }
  }

  async function removeLab(lab: LabItem): Promise<void> {
    try {
      await deleteLab(lab.id)
      // Jika halaman terakhir jadi kosong setelah hapus, mundur satu halaman.
      if (items.value.length === 1 && paging.value.page > 1) paging.value.page -= 1
      await refresh()
    } catch (e) {
      const friendly = toFriendlyMessage(e, 'Gagal menghapus laboratorium')
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
    resetFilters,
    saveLab,
    removeLab,
  }
}
