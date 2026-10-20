import { z, type ZodType } from "zod";
import type {
    CreateLaboratoriumRequest,
    SearchLabRequest,
    UpdateLaboratoriumRequest
} from "../modules/laboratorium/laboratorium.model";

export class LaboratoriumValidation {

    static readonly CREATE: ZodType<CreateLaboratoriumRequest> = z.object({
        kode: z.string().min(3).max(20),
        nama: z.string().min(3).max(50),
        lokasi: z.string().min(3) 
    });

    static readonly UPDATE: ZodType<UpdateLaboratoriumRequest> = z.object({
        id: z.int(),
        kode: z.string().min(3).max(20).optional(),
        nama: z.string().min(3).max(50).optional(),
        lokasi: z.string().min(3).optional()
    });

    static readonly SEARCH: ZodType<SearchLabRequest> = z.object({
        page: z.coerce.number().min(1).default(1),
        size: z.coerce.number().min(1).max(100).default(10),
        kode: z.string().min(3).max(20).optional(),
        nama: z.string().min(3).max(50).optional(),
        lokasi: z.string().min(3).max(50).optional(),
        search: z.string().min(1).max(100).optional()
    })
}