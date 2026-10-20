export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function validateLoginForm(email: string, password: string): string | null {
  if (!isValidEmail(email)) return 'Format email tidak valid'
  if (password.length < 8) return 'Password minimal 8 karakter'
  return null
}

// Aturan disamakan dengan LaboratoriumValidation backend:
// kode 3-20, nama 3-50, lokasi min 3 (agar tidak kena 500 validasi).
export function validateLabForm(kode: string, nama: string, lokasi: string): string | null {
  if (kode.trim().length < 3 || kode.trim().length > 20) return 'Kode minimal 3 dan maksimal 20 karakter'
  if (nama.trim().length < 3 || nama.trim().length > 50) return 'Nama minimal 3 dan maksimal 50 karakter'
  if (lokasi.trim().length < 3) return 'Lokasi minimal 3 karakter'
  return null
}

// Aturan disamakan dengan JadwalValidation backend:
// kegiatan min 5, tanggal mulai tidak boleh lewat, selesai > mulai, lab wajib.
export function validateJadwalForm(
  kegiatan: string,
  tglmulai: string,
  tglselesai: string,
  laboratoriumId: number | null,
): string | null {
  if (kegiatan.trim().length < 5) return 'Kegiatan minimal 5 karakter'
  if (!tglmulai) return 'Waktu mulai wajib diisi'
  if (!tglselesai) return 'Waktu selesai wajib diisi'
  const mulai = new Date(tglmulai)
  const selesai = new Date(tglselesai)
  if (Number.isNaN(mulai.getTime())) return 'Waktu mulai tidak valid'
  if (Number.isNaN(selesai.getTime())) return 'Waktu selesai tidak valid'
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  if (mulai < today) return 'Waktu mulai tidak boleh tanggal yang sudah lewat'
  if (selesai <= mulai) return 'Waktu selesai harus lebih besar dari waktu mulai'
  if (!laboratoriumId) return 'Laboratorium wajib dipilih'
  return null
}

// Aturan disamakan dengan SlotValidation backend:
// tanggal mulai tidak boleh lewat, selesai > mulai, lab wajib (catatan opsional).
export function validateSlotForm(
  tglmulai: string,
  tglselesai: string,
  laboratoriumId: number | null,
): string | null {
  if (!tglmulai) return 'Waktu mulai wajib diisi'
  if (!tglselesai) return 'Waktu selesai wajib diisi'
  const mulai = new Date(tglmulai)
  const selesai = new Date(tglselesai)
  if (Number.isNaN(mulai.getTime())) return 'Waktu mulai tidak valid'
  if (Number.isNaN(selesai.getTime())) return 'Waktu selesai tidak valid'
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  if (mulai < today) return 'Waktu mulai tidak boleh tanggal yang sudah lewat'
  if (selesai <= mulai) return 'Waktu selesai harus lebih besar dari waktu mulai'
  if (!laboratoriumId) return 'Laboratorium wajib dipilih'
  return null
}

// Aturan disamakan dengan CategoryValidation backend: nama 1-100, jumlah int >= 0.
export function validateCategoryForm(nama: string, jumlah: number): string | null {
  if (nama.trim().length < 1 || nama.trim().length > 100) return 'Nama minimal 1 dan maksimal 100 karakter'
  if (!Number.isInteger(jumlah) || jumlah < 0) return 'Jumlah harus bilangan bulat minimal 0'
  return null
}

// Aturan disamakan dengan InventoryValidation backend:
// kode/nama 1-50, kondisi enum, tanggalbeli date, laboratoriumId + categoryId wajib.
export function validateInventoryForm(
  kode: string,
  nama: string,
  tanggalbeli: string,
  laboratoriumId: number | null,
  categoryId: number | null,
): string | null {
  if (kode.trim().length < 1 || kode.trim().length > 50) return 'Kode minimal 1 dan maksimal 50 karakter'
  if (nama.trim().length < 1 || nama.trim().length > 50) return 'Nama minimal 1 dan maksimal 50 karakter'
  if (!tanggalbeli) return 'Tanggal beli wajib diisi'
  if (Number.isNaN(Date.parse(tanggalbeli))) return 'Tanggal beli tidak valid'
  if (!laboratoriumId) return 'Laboratorium wajib dipilih'
  if (!categoryId) return 'Kategori wajib dipilih'
  return null
}
