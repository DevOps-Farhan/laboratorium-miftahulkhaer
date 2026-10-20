// Tipe untuk Jadwal Rutin (dibuat teknisi sekali, berlaku tiap hari):
// GET /api/rutin -> { data: [RutinItem], paging }

export interface RutinLabRef {
  id: number
  kode: string
  nama: string
}

export interface RutinItem {
  id: number
  jamMulai: string
  jamSelesai: string
  catatan: string | null
  aktif: boolean
  laboratoriumId: number
  createdById: number
  laboratorium?: RutinLabRef
}

export interface RutinPaging {
  page: number
  size: number
  total_item: number
  total_page: number
}

export interface RutinsListResult {
  data: RutinItem[]
  paging: RutinPaging
}

export interface CreateRutinPayload {
  jamMulai: string
  jamSelesai: string
  catatan?: string
  laboratoriumId: number
}

export type UpdateRutinPayload = Partial<CreateRutinPayload & { aktif: boolean }>
