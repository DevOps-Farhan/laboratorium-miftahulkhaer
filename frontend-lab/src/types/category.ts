// Tipe untuk Category, mengikuti kontrak backend:
// GET /api/category -> { data: [{ id, nama, jumlah }], paging }
// POST /api/category { nama, jumlah } -> { data: { id, nama, jumlah } }
// PATCH /api/category/:id -> { data: { id, nama, jumlah } }
// DELETE /api/category/:id -> { data: "OK" }

export interface CategoryItem {
  id: number
  nama: string
  jumlah: number
}

export interface CategoryPaging {
  page: number
  size: number
  total_item: number
  total_page: number
}

export interface CategoriesListResult {
  data: CategoryItem[]
  paging: CategoryPaging
}

export interface CategoryFilters {
  search: string
}

export interface CreateCategoryPayload {
  nama: string
  jumlah: number
}

export type UpdateCategoryPayload = Partial<Pick<CreateCategoryPayload, 'nama' | 'jumlah'>>
