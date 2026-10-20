// Client untuk Jadwal Rutin (teknisi saja).
// GET /api/rutin -> { data, paging }
// POST /api/rutin -> { data } 201
// PATCH /api/rutin/:id | DELETE /api/rutin/:id

import { deleteJson, getJson, patchJson, postJsonAuth } from './http'
import type { CreateRutinPayload, RutinItem, RutinsListResult, UpdateRutinPayload } from '../types/rutin'

const PAGE_SIZE = 20

export function listRutins(page: number, laboratoriumId?: number): Promise<RutinsListResult> {
  return getJson('/api/rutin', { page, size: PAGE_SIZE, laboratoriumId })
}

export function createRutin(payload: CreateRutinPayload): Promise<RutinItem> {
  return postJsonAuth<RutinItem>('/api/rutin', payload)
}

export function updateRutin(id: number, payload: UpdateRutinPayload): Promise<RutinItem> {
  return patchJson<RutinItem>(`/api/rutin/${id}`, payload)
}

export async function deleteRutin(id: number): Promise<string> {
  await deleteJson(`/api/rutin/${id}`)
  return 'Jadwal rutin berhasil dihapus'
}
