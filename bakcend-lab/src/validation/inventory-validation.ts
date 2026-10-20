import { ZodType, z } from "zod";
import type { CreateInventoryRequest, SearchInventory, UpdateInvetoryRequest } from "../modules/inventory/inventory.model";
import { Kondisi } from "../../generated/prisma/enums";

export class InventoryValidation {

    static readonly CREATE: ZodType<CreateInventoryRequest> = z.object({
        kode: z.string().min(1).max(50),
        nama: z.string().min(1).max(50),
        kondisi: z.enum(Kondisi),
        tanggalbeli: z.coerce.date(),
        laboratoriumId: z.number().int().positive(),
        categoryId: z.number().int().positive()
    });

    static readonly UPDATE: ZodType<UpdateInvetoryRequest> = z.object({
        id: z.number().int().positive(),
        kode: z.string().min(1).max(50).optional(),
        nama: z.string().min(1).max(50).optional(),
        kondisi: z.enum(Kondisi).optional(),
        tanggalbeli: z.coerce.date().optional(),
        laboratoriumId: z.number().int().positive().optional(),
        categoryId: z.number().int().positive().optional()
    });

    static readonly SEARCH: ZodType<SearchInventory> = z.object({
        page: z.coerce.number().min(1).default(1),
        size: z.coerce.number().min(1).max(100).default(10),
        kode: z.string().min(1).max(100).optional(),
        nama: z.string().min(1).max(100).optional(),
        kondisi: z.enum(Kondisi).optional(),
        tanggalbeli: z.coerce.date().optional(),
        laboratoriumId: z.coerce.number().int().positive().optional(),
        categoryId: z.coerce.number().int().positive().optional(),
        search: z.string().min(1).max(100).optional(),
    });
}
