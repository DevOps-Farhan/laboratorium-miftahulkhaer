import { ZodType, z } from "zod";
import type { CreateCategoryRequest, SearchCategoryRequest, UpdateCategoryRequest } from "../modules/category/category.model";

export class CategoryValidation {

    static readonly CREATE: ZodType<CreateCategoryRequest> = z.object({
        nama: z.string().min(1).max(100),
        jumlah: z.number().int().min(0).default(0)
    });

    static readonly UPDATE: ZodType<UpdateCategoryRequest> = z.object({
        id: z.number().int().positive(),
        nama: z.string().min(1).max(100).optional(),
        jumlah: z.number().int().min(0).optional()
    });

    static readonly SEARCH: ZodType<SearchCategoryRequest> = z.object({
        page: z.coerce.number().min(1).default(1),
        size: z.coerce.number().min(1).max(100).default(10),
        nama: z.string().min(1).max(100).optional(),
        search: z.string().min(1).max(100).optional()
    });
}
