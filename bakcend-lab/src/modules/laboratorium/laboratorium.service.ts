import type { Prisma, User } from "../../../generated/prisma/client";
import { prisma } from "../../../lib/prisma";
import { ResponseError } from "../../error/response-error";
import { LaboratoriumValidation } from "../../validation/laboratorium-validation";
import { Validation } from "../../validation/validation";
import {
    toLaboratoriumResponse, type CreateLaboratoriumRequest, type LaboratoriumResponse, type UpdateLaboratoriumRequest,
    type LaboratoriumListResponse, toLaboratoriumListResponse,
    toUpdateLabResponse
} from "./laboratorium.model";

export class LaboratoriumService {

    static async list(currentUser: User, query: unknown): Promise<LaboratoriumListResponse> {
        if(!currentUser) throw new ResponseError(401, "Unauthorized");

        const req = Validation.validate(LaboratoriumValidation.SEARCH, query);

        const skip = (req.page - 1) * req.size;

        const where: Prisma.LaboratoriumWhereInput = {};
        if (req.kode) where.kode = req.kode;
        if (req.nama) where.nama = req.nama;
        if (req.lokasi) where.lokasi = req.lokasi;
        if (req.search)  {
            where.OR = [
                { kode :  { contains: req.search } },
                { nama: { contains: req.search }},
                { lokasi : { contains: req.search } },
            ]
        }

        const [lab, total] = await Promise.all([
            prisma.laboratorium.findMany({
                where,
                select: {
                    id: true,
                    kode: true,
                    nama: true,
                    lokasi: true
                },
                orderBy: { id: "desc" },
                skip: skip,
                take: req.size
            }),
            prisma.laboratorium.count({ where })
        ])

        return {
            data: lab.map(toLaboratoriumListResponse),
            paging: {
                page: req.page,
                size: req.size,
                total_item: total,
                total_page: Math.ceil(total / req.size)
            }
        }

    }

    static async create(currentUser: User, request: CreateLaboratoriumRequest): Promise<LaboratoriumResponse> {
        if(!currentUser) throw new ResponseError(401, "Unauthorized");

        const createRequest = Validation.validate(LaboratoriumValidation.CREATE, request);

        const existingLaboratorium = await prisma.laboratorium.findUnique({
            where: { kode: createRequest.kode }
        });

        if(existingLaboratorium) throw new ResponseError(409, `laboratorium dengan kode ${request.kode} sudah terdaftar`);

        const laboratorium = await prisma.laboratorium.create({ data : createRequest });

        return toLaboratoriumResponse(laboratorium);
    }

    static async update(currentUser: User, request: UpdateLaboratoriumRequest): Promise<UpdateLaboratoriumRequest> {
        if(!currentUser) throw new ResponseError(401, "Unauthorized");

        const updateRequest = Validation.validate(LaboratoriumValidation.UPDATE, request);

        const existingLaboratorium = await prisma.laboratorium.findUnique({
            where: { id: updateRequest.id }
        });

        if(!existingLaboratorium) throw new ResponseError(404, "Laboratorium tidak ditemukan");

        const {id, ...data} = updateRequest;

        const updatelaboratorium = await prisma.laboratorium.update({
            where: { id },
            data
        });

        return toUpdateLabResponse(updatelaboratorium);
    }

    static async  delete(currentUser: User, id: number): Promise<string> {
        if (!currentUser) throw new ResponseError(401, "Unauthorized");

        const existingLaboratorium = await prisma.laboratorium.findUnique({
            where: { id }
        })

        if(!existingLaboratorium) throw new ResponseError(404, "Laboratorium tidak ditemukan");

        const inventoryCount = await prisma.inventory.count({ where: { laboratoriumId: id } });

        if(inventoryCount > 0) throw new ResponseError(409, `Laboratorium masih dipakai ${inventoryCount} inventory, tidak bisa dihapus`);

        // Jadwal milik lab ikut terhapus (cascade, mengikuti relasi schema).
        await prisma.laboratorium.delete({ where: { id } });

        return "OK";
    }
}