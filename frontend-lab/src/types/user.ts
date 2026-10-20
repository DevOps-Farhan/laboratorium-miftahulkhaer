import type { Role, Status } from './auth'

export type { Role, Status }

export interface ManagedUser {
  id: number
  email: string
  name: string | null
  role: Role
  status: Status
}

export interface UserPaging {
  page: number
  size: number
  total_item: number
  total_page: number
}

export interface UsersListResult {
  data: ManagedUser[]
  paging: UserPaging
}

export interface UserFilters {
  search: string
  role: '' | Role
  status: '' | Status
}

export interface CreateUserPayload {
  email: string
  name?: string
  role: Role
  status: Status
  password: string
}

export type UpdateUserPayload = Partial<
  Pick<CreateUserPayload, 'email' | 'name' | 'role' | 'status' | 'password'>
>

export interface UserRoleSummary {
  total: number
  teknisi: number
  guru: number
  siswa: number
}
