// Client untuk Category (khusus role teknisi).
// GET /api/category -> { data, paging }
// POST /api/category -> { data: { id, nama, jumlah } }
// PATCH /api/category/:id -> { data: { id, nama, jumlah } }
// DELETE /api/category/:id -> { data: "OK" }

import { deleteJson, getJson, patchJson, postJsonAuth } from './http'
import type {
  CategoriesListResult,
  CategoryFilters,
  CategoryItem,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from '../types/category'

const PAGE_SIZE = 10

export function listCategories(page: number, filters: CategoryFilters): Promise<CategoriesListResult> {
  return getJson('/api/category', {
    page,
    size: PAGE_SIZE,
    search: filters.search.trim() || undefined,
  })
}

/** Ambil semua kategori untuk dropdown (tanpa paging UI). */
export async function listAllCategories(): Promise<CategoryItem[]> {
  const result: CategoriesListResult = await getJson('/api/category', { page: 1, size: 100 })
  return result.data
}

export function createCategory(payload: CreateCategoryPayload): Promise<CategoryItem> {
  return postJsonAuth<CategoryItem>('/api/category', payload)
}

export function updateCategory(id: number, payload: UpdateCategoryPayload): Promise<CategoryItem> {
  return patchJson<CategoryItem>(`/api/category/${id}`, payload)
}

export async function deleteCategory(id: number): Promise<void> {
  await deleteJson(`/api/category/${id}`)
}
