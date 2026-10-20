// Client untuk Jadwal.
// GET /api/jadwal -> { data, paging } (guru: hanya miliknya; teknisi: semua; siswa: read-only hari ini)
// POST /api/jadwal (guru) -> { data } 201
// PATCH /api/jadwal/:id (guru, pemilik) -> { data }
// PATCH /api/jadwal/cancel/:id | /undocancel/:id (guru, pemilik) -> { data: string }

import { getJson, patchJson, postJsonAuth } from './http'
import type {
  CreateJadwalPayload,
  JadwalFilters,
  JadwalItem,
  JadwalsListResult,
  UpdateJadwalPayload,
} from '../types/jadwal'

const PAGE_SIZE = 10

export function listJadwals(page: number, filters: JadwalFilters): Promise<JadwalsListResult> {
  return getJson('/api/jadwal', {
    page,
    size: PAGE_SIZE,
    search: filters.search.trim() || undefined,
    status: filters.status,
    laboratoriumId: filters.laboratoriumId,
  })
}

export function createJadwal(payload: CreateJadwalPayload): Promise<JadwalItem> {
  return postJsonAuth<JadwalItem>('/api/jadwal', payload)
}

export function updateJadwal(id: number, payload: UpdateJadwalPayload): Promise<JadwalItem> {
  return patchJson<JadwalItem>(`/api/jadwal/${id}`, payload)
}

export async function cancelJadwal(id: number): Promise<string> {
  const res = await patchJson<{ data?: string } | string>(`/api/jadwal/cancel/${id}`, {})
  return typeof res === 'string' ? res : (res.data ?? 'dibatalkan')
}

export async function undoCancelJadwal(id: number): Promise<string> {
  const res = await patchJson<{ data?: string } | string>(`/api/jadwal/undocancel/${id}`, {})
  return typeof res === 'string' ? res : (res.data ?? 'diaktifkan kembali')
}
