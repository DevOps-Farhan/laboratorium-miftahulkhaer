import type { JadwalSlot } from "../../../generated/prisma/client";
import type { StatusSlot } from "../../../generated/prisma/enums";

export type CreateSlotRequest = {
    catatan?: string;
    tglmulai: Date;
    tglselesai: Date;
    laboratoriumId: number;
};

export type UpdateSlotRequest = {
    catatan?: string | null;
    tglmulai?: Date;
    tglselesai?: Date;
    laboratoriumId?: number;
};

export type BookSlotRequest = {
    catatan?: string;
};

export type SearchSlotRequest = {
    page: number;
    size: number;
    status?: StatusSlot;
    laboratoriumId?: number;
    mine?: boolean;
    date?: string;
    search?: string;
};

export type SlotListItem = {
    id: number;
    catatan: string | null;
    tglmulai: Date;
    tglselesai: Date;
    status: StatusSlot;
    laboratoriumId: number;
    createdById: number;
    bookedById: number | null;
    bookedAt: Date | null;
    laboratorium?: { id: number; kode: string; nama: string };
    bookedBy?: { id: number; name: string | null; email: string } | null;
};

export type SlotListResponse = {
    data: SlotListItem[];
    paging: {
        page: number;
        size: number;
        total_item: number;
        total_page: number;
    };
};

type SlotWithRelations = JadwalSlot & {
    laboratorium?: { id: number; kode: string; nama: string } | null;
    bookedBy?: { id: number; name: string | null; email: string } | null;
};

export function toSlotListItem(slot: SlotWithRelations): SlotListItem {
    return {
        id: slot.id,
        catatan: slot.catatan,
        tglmulai: slot.tglmulai,
        tglselesai: slot.tglselesai,
        status: slot.status,
        laboratoriumId: slot.laboratoriumId,
        createdById: slot.createdById,
        bookedById: slot.bookedById,
        bookedAt: slot.bookedAt,
        ...(slot.laboratorium ? { laboratorium: slot.laboratorium } : {}),
        ...(slot.bookedBy !== undefined ? { bookedBy: slot.bookedBy } : {}),
    };
}
