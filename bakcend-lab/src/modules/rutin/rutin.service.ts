import type { Prisma, User } from "../../../generated/prisma/client";
import { prisma } from "../../../lib/prisma";
import { ResponseError } from "../../error/response-error";
import { RutinValidation } from "../../validation/rutin-validation";
import { Validation } from "../../validation/validation";
import { toRutinListItem, type CreateRutinRequest, type RutinListResponse, type UpdateRutinRequest } from "./rutin.model";
import { clearFutureRutinSlots, expandRutin, rutinJamOverlap } from "./slot-generator";

async function assertJamNoOverlap(
    laboratoriumId: number,
    jamMulai: string,
    jamSelesai: string,
    excludeId?: number,
): Promise<void> {
    const others = await prisma.jadwalRutin.findMany({
        where: {
            laboratoriumId,
            aktif: true,
            ...(excludeId ? { id: { not: excludeId } } : {}),
        },
        select: { jamMulai: true, jamSelesai: true },
    });
    if (others.some((o) => rutinJamOverlap(jamMulai, jamSelesai, o.jamMulai, o.jamSelesai))) {
        throw new ResponseError(409, "Jam rutin bentrok dengan rutin lain di laboratorium yang sama");
    }
}

export class RutinService {
    static async list(currentUser: User, query: unknown): Promise<RutinListResponse> {
        if (!currentUser) throw new ResponseError(401, "unauthorized");

        const req = Validation.validate(RutinValidation.SEARCH, query);
        const skip = (req.page - 1) * req.size;

        const where: Prisma.JadwalRutinWhereInput = {};
        if (req.laboratoriumId) where.laboratoriumId = req.laboratoriumId;
        if (req.aktif !== undefined) where.aktif = req.aktif;

        const [rutins, total] = await Promise.all([
            prisma.jadwalRutin.findMany({
                where,
                include: { laboratorium: { select: { id: true, kode: true, nama: true } } },
                orderBy: [{ laboratoriumId: "asc" }, { jamMulai: "asc" }],
                skip,
                take: req.size,
            }),
            prisma.jadwalRutin.count({ where }),
        ]);

        return {
            data: rutins.map(toRutinListItem),
            paging: {
                page: req.page,
                size: req.size,
                total_item: total,
                total_page: Math.ceil(total / req.size),
            },
        };
    }

    static async create(currentUser: User, request: CreateRutinRequest) {
        if (!currentUser) throw new ResponseError(401, "unauthorized");

        const req = Validation.validate(RutinValidation.CREATE, request);

        const lab = await prisma.laboratorium.findUnique({ where: { id: req.laboratoriumId } });
        if (!lab) throw new ResponseError(404, "Laboratorium tidak ditemukan");

        await assertJamNoOverlap(req.laboratoriumId, req.jamMulai, req.jamSelesai);

        const rutin = await prisma.jadwalRutin.create({
            data: {
                jamMulai: req.jamMulai,
                jamSelesai: req.jamSelesai,
                catatan: req.catatan || null,
                laboratoriumId: req.laboratoriumId,
                createdById: currentUser.id,
            },
        });

        await expandRutin(rutin);
        return toRutinListItem(rutin);
    }

    static async update(currentUser: User, id: number, request: UpdateRutinRequest) {
        if (!currentUser) throw new ResponseError(401, "unauthorized");

        const req = Validation.validate(RutinValidation.UPDATE, request);
        const rutin = await prisma.jadwalRutin.findUnique({ where: { id } });
        if (!rutin) throw new ResponseError(404, "Jadwal rutin tidak ditemukan");

        const jamMulai = req.jamMulai ?? rutin.jamMulai;
        const jamSelesai = req.jamSelesai ?? rutin.jamSelesai;
        const laboratoriumId = req.laboratoriumId ?? rutin.laboratoriumId;

        if (req.laboratoriumId) {
            const lab = await prisma.laboratorium.findUnique({ where: { id: req.laboratoriumId } });
            if (!lab) throw new ResponseError(404, "Laboratorium tidak ditemukan");
        }

        const willBeActive = req.aktif ?? rutin.aktif;
        if (willBeActive) {
            await assertJamNoOverlap(laboratoriumId, jamMulai, jamSelesai, id);
        }

        const jamOrLabChanged =
            jamMulai !== rutin.jamMulai || jamSelesai !== rutin.jamSelesai || laboratoriumId !== rutin.laboratoriumId;
        const deactivating = rutin.aktif && req.aktif === false;

        if (jamOrLabChanged || deactivating) {
            await clearFutureRutinSlots(id);
        }

        const updated = await prisma.jadwalRutin.update({
            where: { id },
            data: {
                ...(req.jamMulai ? { jamMulai: req.jamMulai } : {}),
                ...(req.jamSelesai ? { jamSelesai: req.jamSelesai } : {}),
                ...(req.catatan !== undefined ? { catatan: req.catatan } : {}),
                ...(req.laboratoriumId ? { laboratoriumId: req.laboratoriumId } : {}),
                ...(req.aktif !== undefined ? { aktif: req.aktif } : {}),
            },
        });

        if (updated.aktif && (jamOrLabChanged || !rutin.aktif)) {
            await expandRutin(updated);
        }
        return toRutinListItem(updated);
    }

    static async remove(currentUser: User, id: number): Promise<string> {
        if (!currentUser) throw new ResponseError(401, "unauthorized");

        const rutin = await prisma.jadwalRutin.findUnique({ where: { id } });
        if (!rutin) throw new ResponseError(404, "Jadwal rutin tidak ditemukan");

        await clearFutureRutinSlots(id);
        await prisma.jadwalRutin.delete({ where: { id } });
        return "Jadwal rutin berhasil dihapus";
    }
}
