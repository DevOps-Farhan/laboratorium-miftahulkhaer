import { z, type ZodType } from "zod";
import type { CreateRutinRequest, SearchRutinRequest, UpdateRutinRequest } from "../modules/rutin/rutin.model";

const JAM = /^\d{2}:\d{2}$/;

function jamToMinutes(v: string): number {
    const [h, m] = v.split(":").map(Number);
    return h! * 60 + m!;
}

export class RutinValidation {
    static readonly CREATE: ZodType<CreateRutinRequest> = z.object({
        jamMulai: z.string().regex(JAM, { message: "format jam mulai harus HH:mm" }),
        jamSelesai: z.string().regex(JAM, { message: "format jam selesai harus HH:mm" }),
        catatan: z.string().max(255).optional(),
        laboratoriumId: z.number().int().positive(),
    }).refine((d) => jamToMinutes(d.jamSelesai) > jamToMinutes(d.jamMulai), {
        message: "jam selesai harus lebih besar dari jam mulai",
        path: ["jamSelesai"],
    });

    static readonly UPDATE: ZodType<UpdateRutinRequest> = z.object({
        jamMulai: z.string().regex(JAM, { message: "format jam mulai harus HH:mm" }).optional(),
        jamSelesai: z.string().regex(JAM, { message: "format jam selesai harus HH:mm" }).optional(),
        catatan: z.string().max(255).nullable().optional(),
        laboratoriumId: z.number().int().positive().optional(),
        aktif: z.boolean().optional(),
    });

    static readonly SEARCH: ZodType<SearchRutinRequest> = z.object({
        page: z.coerce.number().min(1).default(1),
        size: z.coerce.number().min(1).max(100).default(10),
        laboratoriumId: z.coerce.number().int().positive().optional(),
        aktif: z.coerce.boolean().optional(),
    });
}
