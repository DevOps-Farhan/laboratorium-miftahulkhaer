import type { JadwalLab } from "../../../generated/prisma/client";
import type { StatusJadwal } from "../../../generated/prisma/enums";

export type CreateJadwalRequest = {
    kegiatan : string;
    tglmulai : Date;
    tglselesai : Date;
    laboratoriumId : number;
}

export type UpdateJadwalRequest = {
    kegiatan? : string;
    tglmulai? : Date;
    tglselesai? : Date;
    laboratoriumId? : number;
}

export type JadwalResponse = {
    kegiatan : string;
    tglmulai : Date;
    tglselesai : Date;
    laboratoriumId : number;
}

export function toJadwalResponse(jadwal: JadwalLab): JadwalResponse {
    return {
        kegiatan: jadwal.kegiatan,
        tglmulai: jadwal.tglmulai,
        tglselesai: jadwal.tglselesai,
        laboratoriumId: jadwal.laboratoriumId
    }
}

export type SearchJadwalRequest = {
    page: number;
    size: number;
    kegiatan?: string;
    status?: StatusJadwal;
    laboratoriumId?: number;
    userId?: number;
    search?: string;
}

export type Paging = {
    page: number;
    size: number;
    total_item: number;
    total_page: number;
};

export type JadwalListItem = {
    id: number;
    kegiatan: string;
    tglmulai: Date;
    tglselesai: Date;
    status: StatusJadwal;
    laboratoriumId: number;
    userId: number;
    laboratorium?: { id: number; kode: string; nama: string };
    user?: { id: number; name: string | null; email: string };
}

export type JadwalListResponse = {
    data: JadwalListItem[],
    paging: Paging
}

type JadwalWithRelations = JadwalLab & {
    laboratorium?: { id: number; kode: string; nama: string } | null;
    user?: { id: number; name: string | null; email: string } | null;
};

export function toJadwalListItem(jadwal: JadwalWithRelations): JadwalListItem {
    return {
        id: jadwal.id,
        kegiatan: jadwal.kegiatan,
        tglmulai: jadwal.tglmulai,
        tglselesai: jadwal.tglselesai,
        status: jadwal.status,
        laboratoriumId: jadwal.laboratoriumId,
        userId: jadwal.userId,
        ...(jadwal.laboratorium ? { laboratorium: jadwal.laboratorium } : {}),
        ...(jadwal.user ? { user: jadwal.user } : {}),
    }
}