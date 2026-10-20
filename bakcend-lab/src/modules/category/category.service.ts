import type { Prisma, User } from "../../../generated/prisma/client";
import { prisma } from "../../../lib/prisma";
import { ResponseError } from "../../error/response-error";
import { CategoryValidation } from "../../validation/category-validation";
import { Validation } from "../../validation/validation";
import { toCreateCategoryResponse, toListCategory, toUpdateCategoryResponse, type CreateCategoryRequest, type CreateCategoryResponse, type ListCategoryResponse, type UpdateCategoryRequest, type UpdateCategoryResponse } from "./category.model";

export class CategoryService {

    static async list(currentUser: User, query: unknown): Promise<ListCategoryResponse> {
        if(!currentUser) throw new ResponseError(401, "Unauthorized");

        const req = Validation.validate(CategoryValidation.SEARCH, query);

        const skip = (req.page - 1) * req.size;

        const where: Prisma.CategoryWhereInput = {};
        if(req.nama) where.nama = { contains: req.nama };
        if(req.search) {
            where.OR = [
                { nama: { contains: req.search } },
            ]
        }

        const [categories, total] = await Promise.all([
            prisma.category.findMany({
                where,
                orderBy: { id: "desc" },
                skip: skip,
                take: req.size
            }),
            prisma.category.count({ where })
        ]);

        return {
            data: categories.map(toListCategory),
            paging: {
                page: req.page,
                size: req.size,
                total_item: total,
                total_page: Math.ceil(total / req.size)
            }
        }
    }

    static async create(currentUser: User, request: CreateCategoryRequest): Promise<CreateCategoryResponse> {
        if(!currentUser) throw new ResponseError(401, "tidak diizinkan");

        const createRequest = Validation.validate(CategoryValidation.CREATE, request);

        const existingCategory = await prisma.category.findUnique({
            where: { nama: createRequest.nama }
        })
        if(existingCategory) throw new ResponseError(409, "category sudah terdaftar");

        const category = await prisma.category.create({
            data: createRequest
        });

        return toCreateCategoryResponse(category);
    }

    static async update(currentUser: User, request: UpdateCategoryRequest): Promise<UpdateCategoryResponse> {
        if(!currentUser) throw new ResponseError(401, "tidak diizinkan");

        const updateRequest = Validation.validate(CategoryValidation.UPDATE, request);

        const existingCategory = await prisma.category.findUnique({
            where: { id: updateRequest.id }
        });

        if(!existingCategory) throw new ResponseError(404, "Category tidak ditemukan");

        if(updateRequest.nama && updateRequest.nama !== existingCategory.nama) {
            const duplicate = await prisma.category.findUnique({
                where: { nama: updateRequest.nama }
            });
            if(duplicate) throw new ResponseError(409, "category sudah terdaftar");
        }

        const { id, ...data } = updateRequest;

        const updated = await prisma.category.update({
            where: { id },
            data
        });

        return toUpdateCategoryResponse(updated);
    }

    static async delete(currentUser: User, id: number): Promise<string> {
        if(!currentUser) throw new ResponseError(401, "tidak diizinkan");

        const existingCategory = await prisma.category.findUnique({
            where: { id }
        });

        if(!existingCategory) throw new ResponseError(404, "Category tidak ditemukan");

        const usedCount = await prisma.inventory.count({
            where: { categoryId: id }
        });

        if(usedCount > 0) throw new ResponseError(409, `Category masih dipakai ${usedCount} inventory, tidak bisa dihapus`);

        await prisma.category.delete({ where: { id } });

        return "OK";
    }
}
