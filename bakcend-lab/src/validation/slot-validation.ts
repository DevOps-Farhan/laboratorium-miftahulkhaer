import { z, type ZodType } from "zod";
import { StatusSlot } from "../../generated/prisma/enums";
import type { BookSlotRequest, CreateSlotRequest, SearchSlotRequest, UpdateSlotRequest } from "../modules/slot/slot.model";

export class SlotValidation {
    static readonly CREATE: ZodType<CreateSlotRequest> = z.object({
        catatan: z.string().max(255).optional(),
        tglmulai: z.coerce.date().refine((date) => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return date >= today;
        }, { message: "tanggal mulai tidak boleh tanggal yang sudah lewat" }),
        tglselesai: z.coerce.date(),
        laboratoriumId: z.number().int().positive(),
    }).refine((data) => data.tglselesai > data.tglmulai, {
        message: "tanggal selesai harus lebih besar dari tanggal mulai",
        path: ["tglselesai"],
    });

    static readonly UPDATE: ZodType<UpdateSlotRequest> = z.object({
        catatan: z.string().max(255).nullable().optional(),
        tglmulai: z.coerce.date().refine((date) => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return date >= today;
        }, { message: "tanggal mulai tidak boleh tanggal yang sudah lewat" }).optional(),
        tglselesai: z.coerce.date().optional(),
        laboratoriumId: z.number().int().positive().optional(),
    });

    static readonly SEARCH: ZodType<SearchSlotRequest> = z.object({
        page: z.coerce.number().min(1).default(1),
        size: z.coerce.number().min(1).max(100).default(10),
        status: z.enum(StatusSlot).optional(),
        laboratoriumId: z.coerce.number().int().positive().optional(),
        mine: z.coerce.boolean().optional(),
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "format tanggal harus YYYY-MM-DD" }).optional(),
        search: z.string().min(1).max(100).optional(),
    });

    static readonly BOOK: ZodType<BookSlotRequest> = z.object({
        catatan: z.string().trim().max(255).optional(),
    });
}
