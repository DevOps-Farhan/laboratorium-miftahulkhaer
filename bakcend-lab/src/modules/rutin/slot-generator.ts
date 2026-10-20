import { prisma } from "../../../lib/prisma";
import type { JadwalRutin } from "../../../generated/prisma/client";

export const EXPAND_DAYS = 14;

function wibParts(d: Date): { y: number; m: number; day: number } {
    const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Jakarta",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).formatToParts(d);
    const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
    return { y: get("year"), m: get("month"), day: get("day") };
}

export function wibTodayKey(): string {
    const { y, m, day } = wibParts(new Date());
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${y}-${pad(m)}-${pad(day)}`;
}

function addDaysKey(key: string, n: number): string {
    const [y, m, d] = key.split("-").map(Number);
    const dt = new Date(Date.UTC(y!, m! - 1, d!));
    dt.setUTCDate(dt.getUTCDate() + n);
    const pad = (x: number) => String(x).padStart(2, "0");
    return `${dt.getUTCFullYear()}-${pad(dt.getUTCMonth() + 1)}-${pad(dt.getUTCDate())}`;
}

function jamToMinutes(jam: string): number {
    const [h, m] = jam.split(":").map(Number);
    return h! * 60 + m!;
}

function overlaps(aMulai: Date, aSelesai: Date, bMulai: Date, bSelesai: Date): boolean {
    return aMulai < bSelesai && aSelesai > bMulai;
}

/** Buat slot harian yang belum ada untuk satu rutin (idempotent). */
export async function expandRutin(rutin: JadwalRutin, days = EXPAND_DAYS): Promise<number> {
    const todayKey = wibTodayKey();
    const endKey = addDaysKey(todayKey, days);

    const existing = await prisma.jadwalSlot.findMany({
        where: {
            laboratoriumId: rutin.laboratoriumId,
            status: { not: "BATAL" },
            tglmulai: {
                gte: new Date(`${todayKey}T00:00:00+07:00`),
                lt: new Date(`${endKey}T00:00:00+07:00`),
            },
        },
        select: { tglmulai: true, tglselesai: true },
    });

    let created = 0;
    for (let i = 0; i < days; i++) {
        const key = addDaysKey(todayKey, i);
        const mulai = new Date(`${key}T${rutin.jamMulai}:00+07:00`);
        const selesai = new Date(`${key}T${rutin.jamSelesai}:00+07:00`);
        if (mulai <= new Date()) continue; // slot hari ini yang jamnya sudah lewat tidak dibuat
        const clash = existing.some((s) => overlaps(mulai, selesai, s.tglmulai, s.tglselesai));
        if (clash) continue;
        await prisma.jadwalSlot.create({
            data: {
                catatan: rutin.catatan,
                tglmulai: mulai,
                tglselesai: selesai,
                laboratoriumId: rutin.laboratoriumId,
                createdById: rutin.createdById,
                rutinId: rutin.id,
            },
        });
        existing.push({ tglmulai: mulai, tglselesai: selesai });
        created++;
    }
    return created;
}

/** Pastikan semua rutin aktif ter-expand (dipanggil lazy saat list). */
export async function ensureRutinSlots(days = EXPAND_DAYS): Promise<void> {
    const rutins = await prisma.jadwalRutin.findMany({ where: { aktif: true } });
    for (const rutin of rutins) {
        await expandRutin(rutin, days);
    }
    // Selaraskan sisa window lama (mis. aturan lama 60 hari): hapus slot rutin
    // TERSEDIA di luar jendela. Booking dan slot manual tidak disentuh.
    const horizon = new Date(`${addDaysKey(wibTodayKey(), days)}T00:00:00+07:00`);
    await prisma.jadwalSlot.deleteMany({
        where: { rutinId: { not: null }, status: "TERSEDIA", tglmulai: { gte: horizon } },
    });
}

/**
 * Bersihkan slot masa depan milik rutin (saat rutin diubah/dinonaktifkan/dihapus).
 * Slot TERSEDIA/BATAL dihapus, booking DIBOOKING dilepas (tetap jalan sebagai slot manual).
 */
export async function clearFutureRutinSlots(rutinId: number): Promise<void> {
    const now = new Date();
    await prisma.jadwalSlot.deleteMany({
        where: { rutinId, status: { in: ["TERSEDIA", "BATAL"] }, tglmulai: { gt: now } },
    });
    await prisma.jadwalSlot.updateMany({
        where: { rutinId, status: "DIBOOKING" },
        data: { rutinId: null },
    });
}

export function rutinJamOverlap(aMulai: string, aSelesai: string, bMulai: string, bSelesai: string): boolean {
    const a1 = jamToMinutes(aMulai);
    const a2 = jamToMinutes(aSelesai);
    const b1 = jamToMinutes(bMulai);
    const b2 = jamToMinutes(bSelesai);
    return a1 < b2 && a2 > b1;
}
