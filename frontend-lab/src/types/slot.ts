// Tipe untuk Slot Jadwal (jadwal ditentukan teknisi, direbut guru):
// GET /api/slot -> { data: [SlotItem], paging }
// Teknisi: semua slot. Guru: slot TERSEDIA masa depan + booking miliknya (mine=true).

export type StatusSlot = 'TERSEDIA' | 'DIBOOKING' | 'BATAL'

export const STATUS_SLOT: StatusSlot[] = ['TERSEDIA', 'DIBOOKING', 'BATAL']

export interface SlotLabRef {
  id: number
  kode: string
  nama: string
}

export interface SlotUserRef {
  id: number
  name: string | null
  email: string
}

export interface SlotItem {
  id: number
  catatan: string | null
  tglmulai: string
  tglselesai: string
  status: StatusSlot
  laboratoriumId: number
  createdById: number
  bookedById: number | null
  bookedAt: string | null
  laboratorium?: SlotLabRef
  bookedBy?: SlotUserRef | null
}

export interface SlotPaging {
  page: number
  size: number
  total_item: number
  total_page: number
}

export interface SlotsListResult {
  data: SlotItem[]
  paging: SlotPaging
}

export interface CreateSlotPayload {
  catatan?: string
  tglmulai: string
  tglselesai: string
  laboratoriumId: number
}

export type UpdateSlotPayload = Partial<CreateSlotPayload>
