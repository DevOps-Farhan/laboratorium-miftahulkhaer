import type { Category } from "../../../generated/prisma/client";

// CREATE REQUEST
export type CreateCategoryRequest = {
    nama: string;
    jumlah: number;
}

export type CreateCategoryResponse = {
    id: number;
    nama: string;
    jumlah: number;
}

export function toCreateCategoryResponse(category: Category): CreateCategoryResponse{
    return {
        id: category.id,
        nama: category.nama,
        jumlah: category.jumlah
    }
}

// UPDATE
export type UpdateCategoryRequest = {
    id: number;
    nama?: string;
    jumlah?: number;
}

export type UpdateCategoryResponse = {
    id: number;
    nama: string;
    jumlah: number;
}

export function toUpdateCategoryResponse(category: Category): UpdateCategoryResponse {
    return {
        id: category.id,
        nama: category.nama,
        jumlah: category.jumlah
    }
}

// SEARCH + LIST (halaman category sertakan jumlah)
export type SearchCategoryRequest = {
    page: number;
    size: number;
    nama?: string;
    search?: string;
}

export type ListCategory = {
    id: number;
    nama: string;
    jumlah: number;
}

export function toListCategory(category: Category): ListCategory {
    return {
        id: category.id,
        nama: category.nama,
        jumlah: category.jumlah
    }
}

export type Paging = {
    page: number;
    size: number;
    total_item: number;
    total_page: number;
};

export type ListCategoryResponse = {
    data: ListCategory[],
    paging: Paging
}
