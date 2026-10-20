import type { Prisma, User } from "../../../generated/prisma/client";
import { prisma } from "../../../lib/prisma";
import { ResponseError } from "../../error/response-error";
import { SlotValidation } from "../../validation/slot-validation";
import { Validation } from "../../validation/validation";
import { toSlotListItem, type BookSlotRequest, type CreateSlotRequest, type SlotListResponse, type UpdateSlotRequest } from "./slot.model";
import { ensureRutinSlots } from "../rutin/slot-generator";

// Rentang hari ini dalam zona WIB (UTC+7) sebagai rentang UTC.
function todayWibRange(): { dayStart: Date; dayEnd: Date } {
    const nowWib = new Date(Date.now() + 7 * 60 * 60 * 1000);
    const key = nowWib.toISOString().slice(0, 10);
    const dayStart = new Date(`${key}T00:00:00+07:00`);
    return { dayStart, dayEnd: new Date(dayStart.getTime() + 24 * 60 * 60 * 1000) };
}

async function assertNoOverlap(
    laboratoriumId: number,
    tglmulai: Date,
    tglselesai: Date,
    excludeId?: number,
): Promise<void> {
    const clash = await prisma.jadwalSlot.findFirst({
        where: {
            laboratoriumId,
            status: { not: "BATAL" },
            tglmulai: { lt: tglselesai },
            tglselesai: { gt: tglmulai },
            ...(excludeId ? { id: { not: excludeId } } : {}),
        },
        select: { id: true },
    });
    if (clash) throw new ResponseError(409, "Slot bentrok dengan slot lain di laboratorium yang sama");
}

export class SlotService {
    static async list(currentUser: User, query: unknown): Promise<SlotListResponse> {
        if (!currentUser) throw new ResponseError(401, "unauthorized");

        const req = Validation.validate(SlotValidation.SEARCH, query);
        const skip = (req.page - 1) * req.size;

        // Slot rutin harian selalu terisi ke depan (lazy, idempotent).
        await ensureRutinSlots();

        const where: Prisma.JadwalSlotWhereInput = {};
        if (req.status) where.status = req.status;
        if (req.laboratoriumId) where.laboratoriumId = req.laboratoriumId;
        if (req.search) where.catatan = { contains: req.search };
        if (req.date) {
            // Hari dalam zona WIB (UTC+7) dipetakan ke rentang UTC.
            // Dipakai via AND agar tidak tertimpa filter peran di bawah.
            const dayStart = new Date(`${req.date}T00:00:00+07:00`);
            if (Number.isNaN(dayStart.getTime())) throw new ResponseError(400, "format tanggal harus YYYY-MM-DD");
            const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
            const and = Array.isArray(where.AND) ? where.AND : [];
            where.AND = [...and, { tglmulai: { gte: dayStart, lt: dayEnd } }];
        }

        if (currentUser.role === "guru") {
            if (req.mine) {
                // Booking milik guru tersebut.
                where.bookedById = currentUser.id;
                where.status = "DIBOOKING";
            } else {
                // Slot yang bisa direbut: masih tersedia dan belum mulai.
                where.status = "TERSEDIA";
                where.tglmulai = { gt: new Date() };
            }
        }

        if (currentUser.role === "siswa") {
            // Portal siswa read-only: hanya booking hari ini, query lain diabaikan.
            const { dayStart, dayEnd } = todayWibRange();
            const and = Array.isArray(where.AND) ? where.AND : [];
            where.AND = [...and, { tglmulai: { gte: dayStart, lt: dayEnd } }];
            where.status = "DIBOOKING";
        }

        const [slots, total] = await Promise.all([
            prisma.jadwalSlot.findMany({
                where,
                include: {
                    laboratorium: { select: { id: true, kode: true, nama: true } },
                    bookedBy: { select: { id: true, name: true, email: true } },
                },
                orderBy: { tglmulai: "asc" },
                skip,
                take: req.size,
            }),
            prisma.jadwalSlot.count({ where }),
        ]);

        return {
            data: slots.map(toSlotListItem),
            paging: {
                page: req.page,
                size: req.size,
                total_item: total,
                total_page: Math.ceil(total / req.size),
            },
        };
    }

    static async create(currentUser: User, request: CreateSlotRequest) {
        if (!currentUser) throw new ResponseError(401, "unauthorized");

        const req = Validation.validate(SlotValidation.CREATE, request);

        const lab = await prisma.laboratorium.findUnique({ where: { id: req.laboratoriumId } });
        if (!lab) throw new ResponseError(404, "Laboratorium tidak ditemukan");

        const tglmulai = new Date(req.tglmulai);
        const tglselesai = new Date(req.tglselesai);
        if (tglmulai < new Date()) throw new ResponseError(400, "waktu mulai tidak boleh waktu yang sudah berlalu");
        if (tglselesai <= tglmulai) throw new ResponseError(400, "waktu selesai harus lebih besar dari waktu mulai");

        await assertNoOverlap(req.laboratoriumId, tglmulai, tglselesai);

        const slot = await prisma.jadwalSlot.create({
            data: {
                catatan: req.catatan || null,
                tglmulai,
                tglselesai,
                laboratoriumId: req.laboratoriumId,
                createdById: currentUser.id,
            },
        });
        return toSlotListItem(slot);
    }

    static async update(currentUser: User, id: number, request: UpdateSlotRequest) {
        if (!currentUser) throw new ResponseError(401, "unauthorized");

        const req = Validation.validate(SlotValidation.UPDATE, request);
        const slot = await prisma.jadwalSlot.findUnique({ where: { id } });
        if (!slot) throw new ResponseError(404, "Slot tidak ditemukan");
        if (slot.status !== "TERSEDIA") throw new ResponseError(409, "Hanya slot yang masih tersedia yang bisa diubah");

        const laboratoriumId = req.laboratoriumId ?? slot.laboratoriumId;
        const tglmulai = req.tglmulai ? new Date(req.tglmulai) : slot.tglmulai;
        const tglselesai = req.tglselesai ? new Date(req.tglselesai) : slot.tglselesai;
        if (tglselesai <= tglmulai) throw new ResponseError(400, "waktu selesai harus lebih besar dari waktu mulai");

        if (req.laboratoriumId) {
            const lab = await prisma.laboratorium.findUnique({ where: { id: req.laboratoriumId } });
            if (!lab) throw new ResponseError(404, "Laboratorium tidak ditemukan");
        }

        await assertNoOverlap(laboratoriumId, tglmulai, tglselesai, id);

        const updated = await prisma.jadwalSlot.update({
            where: { id },
            data: {
                ...(req.catatan !== undefined ? { catatan: req.catatan } : {}),
                ...(req.laboratoriumId ? { laboratoriumId: req.laboratoriumId } : {}),
                ...(req.tglmulai ? { tglmulai } : {}),
                ...(req.tglselesai ? { tglselesai } : {}),
            },
        });
        return toSlotListItem(updated);
    }

    static async remove(currentUser: User, id: number): Promise<string> {
        if (!currentUser) throw new ResponseError(401, "unauthorized");

        const slot = await prisma.jadwalSlot.findUnique({ where: { id } });
        if (!slot) throw new ResponseError(404, "Slot tidak ditemukan");
        if (slot.status === "DIBOOKING") throw new ResponseError(409, "Slot yang sudah dibooking tidak bisa dihapus");

        await prisma.jadwalSlot.delete({ where: { id } });
        return "Slot berhasil dihapus";
    }

    static async cancel(currentUser: User, id: number): Promise<string> {
        if (!currentUser) throw new ResponseError(401, "unauthorized");

        const slot = await prisma.jadwalSlot.findUnique({ where: { id } });
        if (!slot) throw new ResponseError(404, "Slot tidak ditemukan");
        if (slot.status === "BATAL") throw new ResponseError(409, "Slot sudah dibatalkan");

        await prisma.jadwalSlot.update({
            where: { id },
            data: { status: "BATAL", bookedById: null, bookedAt: null },
        });
        return "Slot berhasil dibatalkan";
    }

    static async book(currentUser: User, id: number, request?: BookSlotRequest) {
        if (!currentUser) throw new ResponseError(401, "unauthorized");

        const req = Validation.validate(SlotValidation.BOOK, request ?? {});
        const kelas = req.catatan?.trim() ? req.catatan.trim() : null;

        const slot = await prisma.jadwalSlot.findUnique({ where: { id } });
        if (!slot) throw new ResponseError(404, "Slot tidak ditemukan");
        if (slot.status !== "TERSEDIA") throw new ResponseError(409, "Slot sudah dibooking guru lain");
        if (new Date(slot.tglmulai) <= new Date()) throw new ResponseError(400, "Slot sudah lewat, tidak bisa dibooking");

        // Guru tidak boleh punya booking lain yang bentrok waktunya.
        const clash = await prisma.jadwalSlot.findFirst({
            where: {
                bookedById: currentUser.id,
                status: "DIBOOKING",
                tglmulai: { lt: slot.tglselesai },
                tglselesai: { gt: slot.tglmulai },
            },
            select: { id: true },
        });
        if (clash) throw new ResponseError(409, "Anda sudah punya booking yang bentrok dengan slot ini");

        // Rebutan aman dari race: hanya satu update yang berhasil.
        // Kelas dari guru digabung ke catatan (catatan teknisi tetap dipertahankan).
        const catatan = kelas
            ? slot.catatan
                ? `${slot.catatan} — Kelas: ${kelas}`
                : `Kelas: ${kelas}`
            : slot.catatan;
        const result = await prisma.jadwalSlot.updateMany({
            where: { id, status: "TERSEDIA" },
            data: { status: "DIBOOKING", bookedById: currentUser.id, bookedAt: new Date(), catatan },
        });
        if (result.count === 0) throw new ResponseError(409, "Slot sudah dibooking guru lain");

        const booked = await prisma.jadwalSlot.findUnique({
            where: { id },
            include: {
                laboratorium: { select: { id: true, kode: true, nama: true } },
                bookedBy: { select: { id: true, name: true, email: true } },
            },
        });
        return toSlotListItem(booked!);
    }

    static async unbook(currentUser: User, id: number): Promise<string> {
        if (!currentUser) throw new ResponseError(401, "unauthorized");

        const slot = await prisma.jadwalSlot.findUnique({ where: { id } });
        if (!slot) throw new ResponseError(404, "Slot tidak ditemukan");
        if (slot.status !== "DIBOOKING") throw new ResponseError(409, "Slot tidak sedang dibooking");
        if (currentUser.role === "guru" && slot.bookedById !== currentUser.id) {
            throw new ResponseError(403, "hanya pemilik booking yang boleh membatalkan");
        }
        if (new Date(slot.tglselesai) <= new Date()) throw new ResponseError(400, "Slot sudah selesai, tidak bisa dibatalkan");

        await prisma.jadwalSlot.update({
            where: { id },
            data: { status: "TERSEDIA", bookedById: null, bookedAt: null },
        });
        return "Booking berhasil dibatalkan, slot kembali tersedia";
    }
}
