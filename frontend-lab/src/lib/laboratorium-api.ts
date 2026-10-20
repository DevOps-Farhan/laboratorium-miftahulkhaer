// Client untuk Laboratorium (khusus role teknisi).
// GET /api/laboratorium -> { data, paging }
// POST /api/laboratorium -> { data: { kode, nama, lokasi } } TANPA id
// PATCH /api/laboratorium/:id -> { data: { id, kode, nama, lokasi } }
// DELETE /api/laboratorium/:id -> { data: "OK" }

import { deleteJson, getJson, patchJson, postJsonAuth } from './http'
import type {
  CreatedLabResponse,
  CreateLabPayload,
  LabFilters,
  LabItem,
  LabsListResult,
  UpdateLabPayload,
} from '../types/laboratorium'

const PAGE_SIZE = 10

export function listLabs(page: number, filters: LabFilters): Promise<LabsListResult> {
  return getJson('/api/laboratorium', {
    page,
    size: PAGE_SIZE,
    search: filters.search.trim() || undefined,
  })
}

async function findByKode(kode: string): Promise<LabItem | null> {
  const result: LabsListResult = await getJson('/api/laboratorium', {
    page: 1,
    size: 10,
    kode,
  })
  return result.data.find((l) => l.kode === kode) ?? null
}

/** Ambil semua lab untuk dropdown (tanpa paging UI). */
export async function listAllLabs(): Promise<LabItem[]> {
  const result: LabsListResult = await getJson('/api/laboratorium', { page: 1, size: 100 })
  return result.data
}

export async function createLab(payload: CreateLabPayload): Promise<LabItem> {
  await postJsonAuth<CreatedLabResponse>('/api/laboratorium', payload)
  // Response create tidak memuat id -> re-fetch untuk dapat id.
  const created = await findByKode(payload.kode)
  if (!created) throw new Error('Laboratorium dibuat tetapi id tidak ditemukan, refresh daftar.')
  return created
}

export function updateLab(id: number, payload: UpdateLabPayload): Promise<LabItem> {
  return patchJson<LabItem>(`/api/laboratorium/${id}`, payload)
}

export async function deleteLab(id: number): Promise<void> {
  await deleteJson(`/api/laboratorium/${id}`)
}
