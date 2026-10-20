import { reactive, ref } from 'vue'
import { ApiError } from '../lib/http'
import { waitMinLoading } from '../lib/min-loading'
import { createInventory, deleteInventory, listInventories, updateInventory } from '../lib/inventory-api'
import type {
  CreateInventoryPayload,
  InventoriesListResult,
  InventoryFilters,
  InventoryItem,
  UpdateInventoryPayload,
} from '../types/inventory'

const SEARCH_DEBOUNCE_MS = 400

function toFriendlyMessage(e: unknown, fallback: string): { message: string; status: number } {
  const status = e instanceof ApiError ? e.status : 0
  const raw = e instanceof Error ? e.message : fallback
  if (status === 401) return { message: 'Sesi berakhir, silakan login ulang.', status }
  if (status === 403) return { message: 'Hanya teknisi yang boleh mengelola inventory.', status }
  if (status === 404) return { message: raw, status }
  if (status === 400 || status === 409) return { message: raw, status }
  if (status === 500) return { message: 'Data tidak valid atau kode sudah dipakai.', status }
  return { message: raw || fallback, status }
}

export function useInventory() {
  const items = ref<InventoryItem[]>([])
  const paging = ref({ page: 1, size: 10, total_item: 0, total_page: 0 })
  const filters = reactive<InventoryFilters>({ search: '' })
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
      const result: InventoriesListResult = await listInventories(paging.value.page, filters)
      items.value = result.data
      paging.value = result.paging
    } catch (e) {
      const friendly = toFriendlyMessage(e, 'Gagal memuat inventory')
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

  function setCategoryFilter(value: number | undefined): void {
    filters.categoryId = value
    paging.value.page = 1
    void load()
  }

  function resetFilters(): void {
    filters.search = ''
    filters.laboratoriumId = undefined
    filters.categoryId = undefined
    paging.value.page = 1
    void load()
  }

  async function saveInventory(
    payload: CreateInventoryPayload | UpdateInventoryPayload,
    id: number | null,
  ): Promise<void> {
    try {
      if (id === null) {
        await createInventory(payload as CreateInventoryPayload)
      } else {
        await updateInventory(id, payload as UpdateInventoryPayload)
      }
      await refresh()
    } catch (e) {
      const friendly = toFriendlyMessage(e, 'Gagal menyimpan inventory')
      throw new Error(friendly.message)
    }
  }

  async function removeInventory(item: InventoryItem): Promise<void> {
    try {
      await deleteInventory(item.id)
      if (items.value.length === 1 && paging.value.page > 1) paging.value.page -= 1
      await refresh()
    } catch (e) {
      const friendly = toFriendlyMessage(e, 'Gagal menghapus inventory')
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
    setCategoryFilter,
    resetFilters,
    saveInventory,
    removeInventory,
  }
}
