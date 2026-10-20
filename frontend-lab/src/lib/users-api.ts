// Client untuk Users Management (khusus role teknisi).
// GET /api/users -> { data, paging }
// POST /api/users -> { data }
// PATCH /api/users/:id -> object user langsung (tanpa wrapper)

import { deleteJson, getJson, patchJson, postJsonAuth } from './http'
import type {
  CreateUserPayload,
  ManagedUser,
  UpdateUserPayload,
  UserFilters,
  UserRoleSummary,
  UsersListResult,
} from '../types/user'

const PAGE_SIZE = 12

export function listUsers(page: number, filters: UserFilters): Promise<UsersListResult> {
  return getJson('/api/users', {
    page,
    size: PAGE_SIZE,
    role: filters.role || undefined,
    status: filters.status || undefined,
    search: filters.search.trim() || undefined,
  })
}

export function createUser(payload: CreateUserPayload): Promise<ManagedUser> {
  return postJsonAuth<ManagedUser>('/api/users', payload)
}

export function updateUser(id: number, payload: UpdateUserPayload): Promise<ManagedUser> {
  return patchJson<ManagedUser>(`/api/users/${id}`, payload)
}

export async function deleteUser(id: number): Promise<void> {
  await deleteJson(`/api/users/${id}`)
}

// Ringkasan akurat via total_item dari 4 query ringan (size=1).
export async function fetchUserSummary(): Promise<UserRoleSummary> {
  const [all, teknisi, guru, siswa] = await Promise.all([
    getJson('/api/users', { page: 1, size: 1 }),
    getJson('/api/users', { page: 1, size: 1, role: 'teknisi' }),
    getJson('/api/users', { page: 1, size: 1, role: 'guru' }),
    getJson('/api/users', { page: 1, size: 1, role: 'siswa' }),
  ])
  return {
    total: all.paging.total_item,
    teknisi: teknisi.paging.total_item,
    guru: guru.paging.total_item,
    siswa: siswa.paging.total_item,
  }
}
