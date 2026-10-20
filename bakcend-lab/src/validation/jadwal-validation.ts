import { z, type ZodType } from "zod";
import { StatusJadwal } from "../../generated/prisma/enums";
import type { CreateJadwalRequest, SearchJadwalRequest, UpdateJadwalRequest } from "../modules/jadwal/jadwal.model";

export class JadwalValidation {

    static readonly CREATE: ZodType<CreateJadwalRequest> = z.object({
        kegiatan: z.string().min(5),
        tglmulai: z.coerce.date().refine((date) => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return date >= today;
        }, {message: "tanggal mulai tidak boleh tanggal yang sudah lewat"} ),
        tglselesai: z.coerce.date(),
        laboratoriumId: z.number()
    }).refine((data) => data.tglselesai > data.tglmulai, {
        message: "tanggal selesai harus lebih besar dari tanggal mulai",
        path: ["tglselesai"]
    });

    static readonly UPDATE: ZodType<UpdateJadwalRequest> = z.object({
        kegiatan : z.string().min(5).optional(),
        tglmulai: z.coerce.date().refine((date) => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return date >= today;
        }, {message: "tanggal mulai tidak boleh tanggal yang sudah lewat"}).optional(),
        tglselesai: z.coerce.date().optional(),
        laboratoriumId: z.number().optional()
    });

    static readonly SEARCH: ZodType<SearchJadwalRequest> = z.object({
        page: z.coerce.number().min(1).default(1),
        size: z.coerce.number().min(1).max(100).default(10),
        kegiatan: z.string().min(1).max(100).optional(),
        status: z.enum(StatusJadwal).optional(),
        laboratoriumId: z.coerce.number().int().positive().optional(),
        userId: z.coerce.number().int().positive().optional(),
        search: z.string().min(1).max(100).optional(),
    });
}