import { ref } from 'vue'
import { ApiError } from '../lib/http'
import { waitMinLoading } from '../lib/min-loading'
import { createRutin, deleteRutin, listRutins, updateRutin } from '../lib/rutin-api'
import type { CreateRutinPayload, RutinsListResult, UpdateRutinPayload } from '../types/rutin'

function toFriendlyMessage(e: unknown, fallback: string): { message: string; status: number } {
  const status = e instanceof ApiError ? e.status : 0
  const raw = e instanceof Error ? e.message : fallback
  if (status === 401) return { message: 'Sesi berakhir, silakan login ulang.', status }
  if (status === 403) return { message: 'Anda tidak berhak melakukan aksi ini.', status }
  if (status === 400 || status === 404 || status === 409) return { message: raw, status }
  return { message: raw || fallback, status }
}

export function useRutin() {
  const items = ref<RutinsListResult['data']>([])
  const loading = ref(false)
  const errorMsg = ref('')
  const errorStatus = ref(0)

  async function load(): Promise<void> {
    loading.value = true
    const startedAt = Date.now()
    errorMsg.value = ''
    errorStatus.value = 0
    try {
      const result = await listRutins(1)
      items.value = result.data
    } catch (e) {
      const friendly = toFriendlyMessage(e, 'Gagal memuat jadwal rutin')
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

  async function saveRutin(
    payload: CreateRutinPayload | UpdateRutinPayload,
    id: number | null,
  ): Promise<void> {
    try {
      if (id === null) {
        await createRutin(payload as CreateRutinPayload)
      } else {
        await updateRutin(id, payload as UpdateRutinPayload)
      }
      await refresh()
    } catch (e) {
      const friendly = toFriendlyMessage(e, 'Gagal menyimpan jadwal rutin')
      throw new Error(friendly.message)
    }
  }

  async function removeRutin(id: number): Promise<string> {
    try {
      const message = await deleteRutin(id)
      await refresh()
      return message
    } catch (e) {
      const friendly = toFriendlyMessage(e, 'Gagal menghapus jadwal rutin')
      throw new Error(friendly.message)
    }
  }

  async function toggleRutin(id: number, aktif: boolean): Promise<void> {
    try {
      await updateRutin(id, { aktif })
      await refresh()
    } catch (e) {
      const friendly = toFriendlyMessage(e, 'Gagal mengubah status rutin')
      throw new Error(friendly.message)
    }
  }

  return { items, loading, errorMsg, errorStatus, load, refresh, saveRutin, removeRutin, toggleRutin }
}
