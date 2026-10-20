// Client untuk Inventory (khusus role teknisi).
// GET /api/inventory -> { data, paging } (item memuat relasi laboratorium + category)
// POST /api/inventory -> { data: { id, kode, nama, kondisi, tanggalbeli, laboratoriumId, categoryId } }
// PATCH /api/inventory/:id (parsial) -> { data: {...} }
// DELETE /api/inventory/:id -> { data: { data: "ok" } }

import { deleteJson, getJson, patchJson, postJsonAuth } from './http'
import type {
  CreateInventoryPayload,
  InventoriesListResult,
  InventoryFilters,
  InventoryItem,
  UpdateInventoryPayload,
} from '../types/inventory'

const PAGE_SIZE = 10

export function listInventories(page: number, filters: InventoryFilters): Promise<InventoriesListResult> {
  return getJson('/api/inventory', {
    page,
    size: PAGE_SIZE,
    search: filters.search.trim() || undefined,
    laboratoriumId: filters.laboratoriumId,
    categoryId: filters.categoryId,
  })
}

export function createInventory(payload: CreateInventoryPayload): Promise<InventoryItem> {
  return postJsonAuth<InventoryItem>('/api/inventory', payload)
}

export function updateInventory(id: number, payload: UpdateInventoryPayload): Promise<InventoryItem> {
  return patchJson<InventoryItem>(`/api/inventory/${id}`, payload)
}

export async function deleteInventory(id: number): Promise<void> {
  await deleteJson(`/api/inventory/${id}`)
}
