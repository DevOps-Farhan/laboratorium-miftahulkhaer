import { reactive, ref } from 'vue'
import { ApiError } from '../lib/http'
import { waitMinLoading } from '../lib/min-loading'
import { createUser, deleteUser, fetchUserSummary, listUsers, updateUser } from '../lib/users-api'
import type {
  CreateUserPayload,
  ManagedUser,
  UpdateUserPayload,
  UserFilters,
  UserRoleSummary,
  UsersListResult,
} from '../types/user'

const SEARCH_DEBOUNCE_MS = 400

export function useUsers() {
  const items = ref<ManagedUser[]>([])
  const paging = ref({ page: 1, size: 10, total_item: 0, total_page: 0 })
  const filters = reactive<UserFilters>({ search: '', role: '', status: '' })
  const loading = ref(false)
  const errorMsg = ref('')
  const errorStatus = ref(0)
  const summary = ref<UserRoleSummary | null>(null)

  let searchTimer: ReturnType<typeof setTimeout> | null = null

  async function load(): Promise<void> {
    loading.value = true
    const startedAt = Date.now()
    errorMsg.value = ''
    errorStatus.value = 0
    try {
      const result: UsersListResult = await listUsers(paging.value.page, filters)
      items.value = result.data
      paging.value = result.paging
    } catch (e) {
      errorMsg.value = e instanceof Error ? e.message : 'Gagal memuat users'
      errorStatus.value = e instanceof ApiError ? e.status : 0
    } finally {
      await waitMinLoading(startedAt)
      loading.value = false
    }
  }

  async function refresh(): Promise<void> {
    await load()
    try {
      summary.value = await fetchUserSummary()
    } catch {
      // Ringkasan gagal bukan fatal; tabel tetap tampil.
    }
  }

  function setPage(page: number): void {
    if (page < 1 || page > Math.max(paging.value.total_page, 1)) return
    paging.value.page = page
    void load()
  }

  function applyFilters(): void {
    paging.value.page = 1
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
    filters.role = ''
    filters.status = ''
    paging.value.page = 1
    void load()
  }

  async function saveUser(payload: CreateUserPayload | UpdateUserPayload, id: number | null): Promise<void> {
    if (id === null) {
      await createUser(payload as CreateUserPayload)
    } else {
      await updateUser(id, payload as UpdateUserPayload)
    }
    await refresh()
  }

  async function toggleStatus(user: ManagedUser): Promise<void> {
    await saveUser({ status: user.status === 'aktif' ? 'nonaktif' : 'aktif' }, user.id)
  }

  async function removeUser(user: ManagedUser): Promise<void> {
    try {
      await deleteUser(user.id)
      // Jika halaman terakhir jadi kosong setelah hapus, mundur satu halaman.
      if (items.value.length === 1 && paging.value.page > 1) paging.value.page -= 1
      await refresh()
    } catch (e) {
      const message =
        e instanceof ApiError
          ? e.message
          : e instanceof Error
            ? e.message
            : 'Gagal menghapus user'
      throw new Error(message)
    }
  }

  return {
    items,
    paging,
    filters,
    loading,
    errorMsg,
    errorStatus,
    summary,
    load,
    refresh,
    setPage,
    applyFilters,
    setSearch,
    resetFilters,
    saveUser,
    toggleStatus,
    removeUser,
  }
}
