import { postJson } from './http'
import type { LoginData } from '../types/auth'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

export function loginUser(email: string, password: string): Promise<LoginData> {
  return postJson<LoginData>(`${API_URL}/api/users/login`, { email, password })
}
