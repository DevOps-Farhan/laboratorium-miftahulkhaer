import type { Inventory } from "../../../generated/prisma/client";
import type { Kondisi } from "../../../generated/prisma/enums";

export type SearchInventory = {
    page: number;
    size: number;
    kode?: string;
    nama?: string;
    kondisi?: Kondisi;
    tanggalbeli?: Date;
    laboratoriumId?: number;
    categoryId?: number;
    search?: string;
}

export type Paging = {
    page: number;
    size: number;
    total_item: number;
    total_page: number;
};

export type InventoryListItem = {
    id: number;
    kode: string;
    nama: string;
    kondisi: Kondisi;
    tanggalbeli: Date;
    laboratoriumId: number;
    categoryId: number;
    laboratorium?: { id: number; kode: string; nama: string };
    category?: { id: number; nama: string; jumlah: number };
}

export type InventoryListResponse = {
    data: InventoryListItem[],
    paging: Paging
}

export type CreateInventoryRequest = {
    kode: string;
    nama: string;
    kondisi: Kondisi;
    tanggalbeli: Date;
    laboratoriumId: number;
    categoryId: number;
}

export type UpdateInvetoryRequest = {
    id: number;
    kode?: string;
    nama?: string;
    kondisi?: Kondisi;
    tanggalbeli?: Date;
    laboratoriumId?: number;
    categoryId?: number;
}

export type UpdateInventoryResponse = {
    id: number;
    kode: string;
    nama: string;
    kondisi: Kondisi;
    tanggalbeli: Date;
    laboratoriumId: number;
    categoryId: number;
}

export function toUpdateInventoryResponse(inventory: Inventory): UpdateInventoryResponse{
    return {
        id: inventory.id,
        kode: inventory.kode,
        nama: inventory.nama,
        kondisi: inventory.kondisi,
        tanggalbeli: inventory.tanggalbeli,
        laboratoriumId: inventory.laboratoriumId,
        categoryId: inventory.categoryId
    }
}

export type InventoryResponse = {
    id?: number;
    kode: string;
    nama: string;
    kondisi: Kondisi;
    tanggalbeli: Date;
    laboratoriumId: number;
    categoryId: number;
}

export type DeleteInventoryResponse = string;

export function toInventoryResponse(inventory: Inventory): InventoryResponse {
    return {
        id: inventory.id,
        kode: inventory.kode,
        nama: inventory.nama,
        kondisi: inventory.kondisi,
        tanggalbeli: inventory.tanggalbeli,
        laboratoriumId: inventory.laboratoriumId,
        categoryId: inventory.categoryId
    }
}

type InventoryWithRelations = Inventory & {
    laboratorium?: { id: number; kode: string; nama: string } | null;
    category?: { id: number; nama: string; jumlah: number } | null;
};

export function toInventoryListItem(inventory: InventoryWithRelations): InventoryListItem {
    return {
        id: inventory.id,
        kode: inventory.kode,
        nama: inventory.nama,
        kondisi: inventory.kondisi,
        tanggalbeli: inventory.tanggalbeli,
        laboratoriumId: inventory.laboratoriumId,
        categoryId: inventory.categoryId,
        ...(inventory.laboratorium ? { laboratorium: inventory.laboratorium } : {}),
        ...(inventory.category ? { category: inventory.category } : {}),
    }
}
