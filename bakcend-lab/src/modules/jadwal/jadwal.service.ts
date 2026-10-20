import type { Prisma, User } from "../../../generated/prisma/client";
import { prisma } from "../../../lib/prisma";
import { ResponseError } from "../../error/response-error";
import { JadwalValidation } from "../../validation/jadwal-validation";
import { Validation } from "../../validation/validation";
import { toJadwalListItem, toJadwalResponse, type CreateJadwalRequest, type JadwalListResponse, type JadwalResponse, type UpdateJadwalRequest } from "./jadwal.model";


export class JadwalService {

    static async list(currentUser: User, query: unknown): Promise<JadwalListResponse> {
        if(!currentUser) throw new ResponseError(401, "unauthorized");

        const req = Validation.validate(JadwalValidation.SEARCH, query);

        const skip = (req.page - 1) * req.size;

        const where: Prisma.JadwalLabWhereInput = {};
        if(req.kegiatan) where.kegiatan = { contains: req.kegiatan };
        if(req.status) where.status = req.status;
        if(req.laboratoriumId) where.laboratoriumId = req.laboratoriumId;
        if(req.search) {
            where.OR = [
                { kegiatan: { contains: req.search } },
            ]
        }

        // Guru hanya boleh melihat pengajuannya sendiri, teknisi melihat semua
        // (boleh filter per userId). Siswa read-only: hanya jadwal hari ini (WIB).
        if(currentUser.role === "guru") {
            where.userId = currentUser.id;
        } else if(currentUser.role === "siswa") {
            const nowWib = new Date(Date.now() + 7 * 60 * 60 * 1000);
            const key = nowWib.toISOString().slice(0, 10);
            const dayStart = new Date(`${key}T00:00:00+07:00`);
            const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
            where.tglmulai = { gte: dayStart, lt: dayEnd };
            // Siswa hanya melihat jadwal yang sudah dibooking guru (yang dibatalkan disembunyikan).
            where.status = { not: "BATAL" };
        } else if(req.userId) {
            where.userId = req.userId;
        }

        const [jadwal, total] = await Promise.all([
            prisma.jadwalLab.findMany({
                where,
                include: {
                    laboratorium: { select: { id: true, kode: true, nama: true } },
                    user: { select: { id: true, name: true, email: true } },
                },
                orderBy: { tglmulai: "desc" },
                skip: skip,
                take: req.size
            }),
            prisma.jadwalLab.count({ where })
        ]);

        return {
            data: jadwal.map(toJadwalListItem),
            paging: {
                page: req.page,
                size: req.size,
                total_item: total,
                total_page: Math.ceil(total / req.size)
            }
        }
    }

    static async create(currentUser: User, request: CreateJadwalRequest): Promise<JadwalResponse> {
        if(!currentUser) throw new ResponseError(401, "unauthorized");

        const jadwalRequest = Validation.validate(JadwalValidation.CREATE, request);

        const existingJadwal = await prisma.jadwalLab.findFirst({
            where: { 
                laboratoriumId: jadwalRequest.laboratoriumId,
                status: "BELUM_MULAI",
                tglmulai: jadwalRequest.tglmulai
            }
        });

        if(existingJadwal) throw new ResponseError(409, "Jadwal sudah di booking");

        const tglmulai = new Date(jadwalRequest.tglmulai);
        const tglselesai = new Date(jadwalRequest.tglselesai);
        const sekarang = new Date();
        if(tglmulai < sekarang) throw new ResponseError(400, "waktu mulai tidak boleh waktu yang sudah berlalu");
        if(tglselesai <= tglmulai) throw new ResponseError(400, "waktu selesai tidak boleh kecil dari tanggal mulai");

        const jadwal = await prisma.jadwalLab.create({ data : {
            kegiatan: jadwalRequest.kegiatan,
            tglmulai: jadwalRequest.tglmulai,
            tglselesai: jadwalRequest.tglselesai,
            laboratoriumId: jadwalRequest.laboratoriumId,
            userId: currentUser.id
        }});

        return toJadwalResponse(jadwal);
    }

    static async update(currentUser: User, id: number, request: UpdateJadwalRequest): Promise<JadwalResponse> {
        if(!currentUser) throw new ResponseError(401, "unauthorized");

        const updateRequest = Validation.validate(JadwalValidation.UPDATE, request)

        const existingJadwal = await prisma.jadwalLab.findUnique({
            where: { id }
        });
        if(!existingJadwal) throw new ResponseError(404, "Jadwal tidak ditemukan");

        if(currentUser.role === "guru" && existingJadwal.userId !== currentUser.id) {
            throw new ResponseError(403, "hanya pemilik pengajuan yang boleh mengubah");
        }

        const tglmulai = new Date(updateRequest.tglmulai!);
        const tglselesai = new Date(updateRequest.tglselesai!);
        const sekarang = new Date();
        if(tglmulai < sekarang) throw new ResponseError(400, "waktu mulai tidak boleh waktu yang sudah berlalu");
        if(tglselesai <= tglmulai) throw new ResponseError(400, "waktu selesai tidak boleh kecil dari tanggal mulai");

        const updateJadwal = await prisma.jadwalLab.update({
            where: { id },
            data: updateRequest
        })
        return toJadwalResponse(updateJadwal);
    }

    static async cancel(currentUser: User, id: number): Promise<string> {
        if(!currentUser) throw new ResponseError(401, "unauthorized");

        const jadwal = await prisma.jadwalLab.findUnique({
            where: { id }
        });

        if(currentUser.role === "guru" && jadwal?.userId !== currentUser.id) {
            throw new ResponseError(403, "hanya pemilik yang boleh membatalkan");
        }

        await prisma.jadwalLab.update({
            where: { id },
            data: { status: "BATAL" }
        })
        return "berhasil dibatalkan";
    }

    static async undoCancel(currentUser: User, id: number): Promise<string> {
        if(!currentUser) throw new ResponseError(401, "unauthorized");

        const jadwal = await prisma.jadwalLab.findUnique({
            where: { id }
        });

        if(currentUser.role === "guru" && currentUser.id !== jadwal?.userId) {
            throw new ResponseError(403, "hanya pemilik pengajuan yang boleh mengubah");
        }

        const existingJadwal = await prisma.jadwalLab.findFirst({
            where: {
                laboratoriumId: jadwal?.laboratoriumId,
                status: "BELUM_MULAI",
                tglmulai: jadwal?.tglmulai
            }
        });
        if(existingJadwal) throw new ResponseError(409, "maaf jadwal sudah dibooking");

        await prisma.jadwalLab.update({
            where: { id },
            data: { status: "BELUM_MULAI" }
        });

        return "jadwal berhasil diaktifkan kembali"
    }
}