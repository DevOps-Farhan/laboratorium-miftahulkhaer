// HTTP client yang memahami kontrak backend:
// - Sukses: { data } atau { data, paging } (list users)
// - Gagal login: { error } tunggal dengan HTTP 200
// - Gagal lain: { errors } via ResponseError
// Semua request private memakai header X-API-TOKEN.

import { authHeaders } from './token-storage'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

export class ApiError extends Error {
  status: number
  /** Detik menunggu dari header Retry-After (ada saat HTTP 429). */
  retryAfter?: number
  constructor(message: string, status = 0, retryAfter?: number) {
    super(message)
    this.status = status
    this.retryAfter = retryAfter
  }
}

type QueryValue = string | number | undefined

function withQuery(path: string, query?: Record<string, QueryValue>): string {
  if (!query) return `${API_URL}${path}`
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== '') params.set(key, String(value))
  }
  const qs = params.toString()
  return qs ? `${API_URL}${path}?${qs}` : `${API_URL}${path}`
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toErrorsMessage(errors: any): string {
  // Backend me-return Zod issues (array) untuk validasi gagal (HTTP 400).
  if (Array.isArray(errors)) {
    const first = errors[0] as { message?: string; path?: (string | number)[] } | undefined
    if (first?.message) {
      const where = Array.isArray(first.path) && first.path.length ? ` (${first.path.join('.')})` : ''
      return `${first.message}${where}`
    }
    return 'Data tidak valid'
  }
  if (typeof errors === 'string') return errors
  return 'Request gagal'
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handle(res: Response): Promise<any> {
  const body = await res.json().catch(() => ({}))
  if (body?.error) throw new ApiError(body.error, res.status)
  if (body?.errors) throw new ApiError(toErrorsMessage(body.errors), res.status)
  if (!res.ok) {
    const raw = res.headers.get('Retry-After')
    const parsed = raw !== null ? Number.parseInt(raw, 10) : NaN
    const retryAfter = Number.isFinite(parsed) && parsed > 0 ? parsed : undefined
    const message =
      res.status === 429 ? 'Terlalu banyak permintaan, coba lagi nanti.' : `Request gagal (${res.status})`
    throw new ApiError(message, res.status, retryAfter)
  }
  return body
}

export function getJson(
  path: string,
  query?: Record<string, QueryValue>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> {
  return fetch(withQuery(path, query), { headers: { ...authHeaders() } }).then(handle)
}

export async function postJson<T>(url: string, payload: unknown): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const body = await handle(res)
  if (body.data === undefined) throw new ApiError('Response API tidak valid', res.status)
  return body.data as T
}

export async function postJsonAuth<T>(path: string, payload: unknown): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  })
  const body = await handle(res)
  if (body.data === undefined) throw new ApiError('Response API tidak valid', res.status)
  return body.data as T
}

// PATCH /api/users/:id me-return object user langsung tanpa wrapper { data }.
export async function patchJson<T>(path: string, payload: unknown): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  })
  const body = await handle(res)
  return (body.data ?? body) as T
}

// DELETE me-return { data: "OK" } untuk laboratorium.
export async function deleteJson(path: string): Promise<void> {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'DELETE',
    headers: { ...authHeaders() },
  })
  await handle(res)
}
