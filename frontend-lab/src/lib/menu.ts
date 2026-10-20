export type MenuKey = 'dashboard' | 'users' | 'laboratorium' | 'category' | 'inventory' | 'jadwal'

export interface MenuItem {
  key: MenuKey
  label: string
  desc: string
}

export const MENU_ITEMS: MenuItem[] = [
  { key: 'dashboard', label: 'Dashboard', desc: 'Ringkasan' },
  { key: 'users', label: 'User Management', desc: 'Kelola teknisi, guru, siswa' },
  { key: 'laboratorium', label: 'Laboratorium', desc: 'Data lab' },
  { key: 'category', label: 'Kategori', desc: 'Kategori + stok barang' },
  { key: 'inventory', label: 'Inventory', desc: 'Barang inventaris' },
  { key: 'jadwal', label: 'Jadwal', desc: 'Jadwal pemakaian lab' },
]

// Menu khusus portal guru (pengajuan jadwal).
export const GURU_MENU_ITEMS: MenuItem[] = [
  { key: 'dashboard', label: 'Dashboard', desc: 'Ringkasan' },
  { key: 'jadwal', label: 'Pengajuan Jadwal', desc: 'Ajukan pemakaian lab' },
]

// Menu khusus portal siswa (read-only jadwal hari ini).
export const SISWA_MENU_ITEMS: MenuItem[] = [
  { key: 'dashboard', label: 'Dashboard', desc: 'Ringkasan' },
  { key: 'jadwal', label: 'Jadwal Hari Ini', desc: 'Lihat pemakaian lab hari ini' },
]
