// Tipe untuk Laboratorium, mengikuti kontrak backend:
// docs/laboratorium.api.md (backend) — GET list, POST, PATCH /:id, DELETE /:id.
// Perhatian asimetri backend:
// - GET list item: { id, kode, nama, lokasi }
// - POST create:   { kode, nama, lokasi } TANPA id (frontend re-fetch untuk dapat id)
// - PATCH update:  { id, kode, nama, lokasi }

export interface LabItem {
  id: number
  kode: string
  nama: string
  lokasi: string
}

export interface LabPaging {
  page: number
  size: number
  total_item: number
  total_page: number
}

export interface LabsListResult {
  data: LabItem[]
  paging: LabPaging
}

export interface LabFilters {
  search: string
}

export interface CreateLabPayload {
  kode: string
  nama: string
  lokasi: string
}

export type UpdateLabPayload = Partial<Pick<CreateLabPayload, 'kode' | 'nama' | 'lokasi'>>

export interface CreatedLabResponse {
  kode: string
  nama: string
  lokasi: string
}
