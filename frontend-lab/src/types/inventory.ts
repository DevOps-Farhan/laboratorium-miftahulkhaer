// Tipe untuk Inventory, mengikuti kontrak backend:
// GET /api/inventory -> { data: [InventoryItem], paging }
// POST /api/inventory { kode, nama, kondisi, tanggalbeli, laboratoriumId, categoryId }
//   -> { data: { id, kode, nama, kondisi, tanggalbeli, laboratoriumId, categoryId } }
// PATCH /api/inventory/:id (parsial) -> { data: {...} }
// DELETE /api/inventory/:id -> { data: { data: "ok" } }
// Catatan: kolom `jumlah` sudah dihapus dari inventory, pindah ke category.

export type Kondisi = 'bagus' | 'rusak'

export interface InventoryLabRef {
  id: number
  kode: string
  nama: string
}

export interface InventoryCategoryRef {
  id: number
  nama: string
  jumlah: number
}

export interface InventoryItem {
  id: number
  kode: string
  nama: string
  kondisi: Kondisi
  tanggalbeli: string
  laboratoriumId: number
  categoryId: number
  laboratorium?: InventoryLabRef
  category?: InventoryCategoryRef
}

export interface InventoryPaging {
  page: number
  size: number
  total_item: number
  total_page: number
}

export interface InventoriesListResult {
  data: InventoryItem[]
  paging: InventoryPaging
}

export interface InventoryFilters {
  search: string
  laboratoriumId?: number
  categoryId?: number
}

export interface CreateInventoryPayload {
  kode: string
  nama: string
  kondisi: Kondisi
  tanggalbeli: string
  laboratoriumId: number
  categoryId: number
}

export type UpdateInventoryPayload = Partial<
  Pick<CreateInventoryPayload, 'kode' | 'nama' | 'kondisi' | 'tanggalbeli' | 'laboratoriumId' | 'categoryId'>
>
