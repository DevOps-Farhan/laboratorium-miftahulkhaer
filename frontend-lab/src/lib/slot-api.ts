// Client untuk Slot Jadwal.
// GET /api/slot -> { data, paging } (guru: slot TERSEDIA + booking miliknya; teknisi: semua; siswa: read-only booking hari ini)
// POST /api/slot (teknisi) -> { data } 201
// PATCH /api/slot/:id (teknisi, hanya TERSEDIA)
// DELETE /api/slot/:id (teknisi, tidak bisa yang DIBOOKING)
// PATCH /api/slot/cancel/:id (teknisi)
// POST /api/slot/book/:id (guru, rebutan) | POST /api/slot/unbook/:id (pemilik/teknisi)

import { deleteJson, getJson, patchJson, postJsonAuth } from './http'
import type {
  CreateSlotPayload,
  SlotItem,
  SlotsListResult,
  UpdateSlotPayload,
} from '../types/slot'

const PAGE_SIZE = 10

export interface SlotListFilters {
  search?: string
  status?: string
  laboratoriumId?: number
  mine?: boolean
  date?: string
}

export function listSlots(page: number, filters: SlotListFilters, size = PAGE_SIZE): Promise<SlotsListResult> {
  return getJson('/api/slot', {
    page,
    size,
    search: filters.search?.trim() || undefined,
    status: filters.status as string | undefined,
    laboratoriumId: filters.laboratoriumId,
    mine: filters.mine ? 1 : undefined,
    date: filters.date || undefined,
  })
}

export function createSlot(payload: CreateSlotPayload): Promise<SlotItem> {
  return postJsonAuth<SlotItem>('/api/slot', payload)
}

export function updateSlot(id: number, payload: UpdateSlotPayload): Promise<SlotItem> {
  return patchJson<SlotItem>(`/api/slot/${id}`, payload)
}

export function deleteSlot(id: number): Promise<void> {
  return deleteJson(`/api/slot/${id}`)
}

export async function cancelSlot(id: number): Promise<string> {
  const res = await patchJson<{ data?: string } | string>(`/api/slot/cancel/${id}`, {})
  return typeof res === 'string' ? res : (res.data ?? 'dibatalkan')
}

export function bookSlot(id: number, payload?: { catatan?: string }): Promise<SlotItem> {
  return postJsonAuth<SlotItem>(`/api/slot/book/${id}`, payload ?? {})
}

export async function unbookSlot(id: number): Promise<string> {
  const res = await postJsonAuth<{ data?: string } | string>(`/api/slot/unbook/${id}`, {})
  return typeof res === 'string' ? res : (res.data ?? 'dibatalkan')
}
