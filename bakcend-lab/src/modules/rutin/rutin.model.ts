import type { JadwalRutin } from "../../../generated/prisma/client";

export type CreateRutinRequest = {
    jamMulai: string;
    jamSelesai: string;
    catatan?: string;
    laboratoriumId: number;
};

export type UpdateRutinRequest = {
    jamMulai?: string;
    jamSelesai?: string;
    catatan?: string | null;
    laboratoriumId?: number;
    aktif?: boolean;
};

export type SearchRutinRequest = {
    page: number;
    size: number;
    laboratoriumId?: number;
    aktif?: boolean;
};

export type RutinListItem = {
    id: number;
    jamMulai: string;
    jamSelesai: string;
    catatan: string | null;
    aktif: boolean;
    laboratoriumId: number;
    createdById: number;
    laboratorium?: { id: number; kode: string; nama: string };
};

export type RutinListResponse = {
    data: RutinListItem[];
    paging: {
        page: number;
        size: number;
        total_item: number;
        total_page: number;
    };
};

type RutinWithRelations = JadwalRutin & {
    laboratorium?: { id: number; kode: string; nama: string } | null;
};

export function toRutinListItem(rutin: RutinWithRelations): RutinListItem {
    return {
        id: rutin.id,
        jamMulai: rutin.jamMulai,
        jamSelesai: rutin.jamSelesai,
        catatan: rutin.catatan,
        aktif: rutin.aktif,
        laboratoriumId: rutin.laboratoriumId,
        createdById: rutin.createdById,
        ...(rutin.laboratorium ? { laboratorium: rutin.laboratorium } : {}),
    };
}
