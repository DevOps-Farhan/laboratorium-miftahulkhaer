import type { JadwalItem, StatusJadwal } from '../types/jadwal'

export function resolveEffectiveStatus(item: Pick<JadwalItem, 'status' | 'tglmulai' | 'tglselesai'>): StatusJadwal {
  if (item.status === 'BATAL' || item.status === 'SELESAI') return item.status
  const mulai = new Date(item.tglmulai).getTime()
  const selesai = new Date(item.tglselesai).getTime()
  if (Number.isNaN(mulai) || Number.isNaN(selesai)) return item.status
  const now = Date.now()
  if (now >= selesai) return 'SELESAI'
  if (now >= mulai) return 'DALAM_SESI'
  return 'BELUM_MULAI'
}

export function isJadwalOverdue(item: Pick<JadwalItem, 'tglmulai' | 'tglselesai'>): boolean {
  const selesai = new Date(item.tglselesai).getTime()
  if (Number.isNaN(selesai)) return false
  return Date.now() >= selesai
}
