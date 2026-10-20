import type { LoginData } from '../types/auth'

const TOKEN_KEY = 'lab_token'
const USER_KEY = 'lab_user'

export function saveToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

export function saveUserProfile(user: LoginData): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function getUserProfile(): LoginData | null {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? (JSON.parse(raw) as LoginData) : null
  } catch {
    return null
  }
}

export function clearSession(): void {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

// Helper untuk request private berikutnya (header X-API-TOKEN).
export function authHeaders(): Record<string, string> {
  const token = getToken()
  return token ? { 'X-API-TOKEN': token } : {}
}
