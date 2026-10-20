import type { Prisma, User } from "../../../generated/prisma/client";
import { prisma } from "../../../lib/prisma";
import { hashPassword } from "../../../lib/password";
import { ResponseError } from "../../error/response-error";
import {
    toUsersResponse,
    type CreateUsersRequest,
    type SearchUsersRequest,
    type UpdateUsersRequest,
    type UsersListResponse,
    type UsersResponse,
    toUsersListResponse
} from "./users.model";
import { Validation } from "../../validation/validation";
import { UserValidation } from "../../validation/user-validation";

export class UsersService {

    static async list(currentUser: User, query: unknown): Promise<UsersListResponse> {
        if(!currentUser) throw new ResponseError(401, "unauthorized");

        const req = Validation.validate<SearchUsersRequest>(UserValidation.SEARCH, query);

        const skip = (req.page - 1) * req.size;

        const where: Prisma.UserWhereInput = {};
        if(req.role) where.role = req.role;
        if(req.status) where.status = req.status;
        if(req.search) {
            where.OR = [
                { name: {contains: req.search} },
                { email: {contains: req.search}},
            ]
        }

        // Promise.all() menjalankan query database secara pararel
        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    status: true
                }, 
                orderBy: { id: "desc" },
                skip: skip,
                take: req.size
            }),
            prisma.user.count({ where })
        ]); 

        return {
            data: users.map(toUsersListResponse),
            paging: {
                page: req.page,
                size: req.size,
                total_item: total,
                total_page: Math.ceil(total / req.size)
            }
        }
    }

    static async create(currentUser: User, request: CreateUsersRequest): Promise<UsersResponse> {
        if(!currentUser) throw new ResponseError(401, "unauthorized");

        const userRequest = Validation.validate(UserValidation.CREATE, request);

        const existingUser = await prisma.user.findUnique({
            where: { email: userRequest.email }
        })

        if(existingUser) throw new ResponseError(409, "User sudah terdaftar");

        const hashedPassword = await hashPassword(userRequest.password);

        const newUser = await prisma.user.create({
            data: { ...userRequest, password: hashedPassword }
        })

        return toUsersResponse(newUser);
    }

    static async update(currentUser: User, id: number, request: UpdateUsersRequest): Promise<UsersResponse> {
        if(!currentUser) throw new ResponseError(401, "unauthorized");

        const updateRequest = Validation.validate(UserValidation.UPDATEUSERS, request);

        const existingUser = await prisma.user.findUnique({
            where: { id }
        })

        if(!existingUser) throw new ResponseError(404, "User tidak ditemukan");

        if(updateRequest.password) {
            updateRequest.password = await hashPassword(updateRequest.password)
        }

        const updateUser = await prisma.user.update({
            where: { id },
            data: updateRequest
        });

        return toUsersResponse(updateUser);
    }

    static async nonaktif(currentUser: User, id: number): Promise<string> {
        if(!currentUser) throw new ResponseError(401, "unauthorized");

        await prisma.user.update({
            where: { id },
            data: {
                status: "nonaktif"
            }
        });
        return "user berhasil dinonaktif";
    }

    static async delete(currentUser: User, id: number): Promise<string> {
        if(!currentUser) throw new ResponseError(401, "unauthorized");

        if(id === currentUser.id) throw new ResponseError(403, "tidak bisa menghapus akun sendiri");

        const existingUser = await prisma.user.findUnique({
            where: { id }
        });

        if(!existingUser) throw new ResponseError(404, "User tidak ditemukan");

        // Jadwal milik user ikut terhapus (cascade, mengikuti relasi schema).
        await prisma.user.delete({ where: { id } });

        return "OK";
    }
}