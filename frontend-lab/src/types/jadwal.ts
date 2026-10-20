// Tipe untuk Jadwal, mengikuti kontrak backend:
// GET /api/jadwal -> { data: [JadwalItem], paging }
// Item memuat relasi laboratorium { id, kode, nama } + user { id, name, email }.
// Scoping backend: teknisi melihat semua, guru hanya miliknya.

export type StatusJadwal = 'BELUM_MULAI' | 'BATAL' | 'DALAM_SESI' | 'SELESAI'

export const STATUS_JADWAL: StatusJadwal[] = ['BELUM_MULAI', 'BATAL', 'DALAM_SESI', 'SELESAI']

export interface JadwalLabRef {
  id: number
  kode: string
  nama: string
}

export interface JadwalUserRef {
  id: number
  name: string | null
  email: string
}

export interface JadwalItem {
  id: number
  kegiatan: string
  tglmulai: string
  tglselesai: string
  status: StatusJadwal
  laboratoriumId: number
  userId: number
  laboratorium?: JadwalLabRef
  user?: JadwalUserRef
}

export interface JadwalPaging {
  page: number
  size: number
  total_item: number
  total_page: number
}

export interface JadwalsListResult {
  data: JadwalItem[]
  paging: JadwalPaging
}

export interface JadwalFilters {
  search: string
  status?: StatusJadwal
  laboratoriumId?: number
}

export interface CreateJadwalPayload {
  kegiatan: string
  tglmulai: string
  tglselesai: string
  laboratoriumId: number
}

export type UpdateJadwalPayload = Partial<
  Pick<CreateJadwalPayload, 'kegiatan' | 'tglmulai' | 'tglselesai' | 'laboratoriumId'>
>
