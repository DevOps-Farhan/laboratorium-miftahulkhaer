import type { Laboratorium } from "../../../generated/prisma/client"
import type {Pick} from "@prisma/client/runtime/client";

export type SearchLabRequest = {
    page: number;
    size: number;
    kode? : string;
    nama? : string;
    lokasi? : string;
    search?: string;
}

export type CreateLaboratoriumRequest = {
    kode: string;
    nama: string;
    lokasi: string;
}

export type UpdateLaboratoriumRequest = {
    id: number;
    kode?: string;
    nama?: string;
    lokasi?: string;
}

export type UpdateLaboratoriumResponse = {
    id: number;
    kode: string;
    nama: string;
    lokasi: string;
}

export function toUpdateLabResponse(laboratorium: Laboratorium): UpdateLaboratoriumResponse {
    return {
        id: laboratorium.id,
        kode: laboratorium.kode,
        nama: laboratorium.nama,
        lokasi: laboratorium.lokasi
    }
}

export type LaboratoriumResponse = {
    kode: string;
    nama: string;
    lokasi: string;
}

export type Paging = {
    page: number;
    size: number;
    total_item: number;
    total_page: number;
};

export type LaboratoriumListResponse = {
    data: LaboratoriumResponse[];
    paging: Paging;
}

export type LabResponse = {
    id: number;
    kode: string;
    nama: string;
    lokasi: string;
}

export function toLaboratoriumListResponse(labs: Pick<Laboratorium, "id" | "kode" | "nama" | "lokasi">): LabResponse {
    return {
        id: labs.id,
        kode: labs.kode,
        nama: labs.nama,
        lokasi: labs.lokasi
    }
}

export function toLaboratoriumResponse(laboratorium: Laboratorium): LaboratoriumResponse {
    return {
        kode: laboratorium.kode,
        nama: laboratorium.nama,
        lokasi: laboratorium.lokasi
    }
}