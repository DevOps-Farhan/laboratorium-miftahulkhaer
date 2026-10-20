// Helper tanggal untuk strip jadwal (zona waktu lokal browser, WIB bagi pengguna lab).

export interface DayInfo {
  key: string // YYYY-MM-DD (waktu lokal)
  date: Date
  dayName: string // Sen, Sel, ...
  dayNum: number // tanggal
  monthShort: string // Okt
  isToday: boolean
  isPast: boolean
}

const DAY_NAMES = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']

export function toDayKey(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function todayKey(): string {
  return toDayKey(new Date())
}

function startOfDay(d: Date): Date {
  const c = new Date(d)
  c.setHours(0, 0, 0, 0)
  return c
}

/** Senin pertama dari minggu yang memuat tanggal tersebut. */
export function mondayOfWeek(d: Date): Date {
  const c = startOfDay(d)
  const dow = (c.getDay() + 6) % 7 // Sen=0 ... Min=6
  c.setDate(c.getDate() - dow)
  return c
}

export function weekDays(monday: Date): DayInfo[] {
  const today = startOfDay(new Date())
  const out: DayInfo[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday)
    d.setDate(d.getDate() + i)
    out.push({
      key: toDayKey(d),
      date: d,
      dayName: DAY_NAMES[d.getDay()] ?? '',
      dayNum: d.getDate(),
      monthShort: d.toLocaleString('id-ID', { month: 'short' }),
      isToday: d.getTime() === today.getTime(),
      isPast: d.getTime() < today.getTime(),
    })
  }
  return out
}

export function weekLabel(monday: Date): string {
  const end = new Date(monday)
  end.setDate(end.getDate() + 6)
  const fmt = (d: Date) =>
    d.toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
  return `${fmt(monday)} – ${fmt(end)}`
}

export function formatDayLong(key: string): string {
  const [y, m, d] = key.split('-').map(Number)
  const dt = new Date(y!, m! - 1, d!)
  if (Number.isNaN(dt.getTime())) return key
  return dt.toLocaleString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function formatTime(value: string): string {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit' })
}
