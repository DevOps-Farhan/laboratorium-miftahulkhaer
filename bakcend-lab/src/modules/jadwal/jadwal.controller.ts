import type { Context } from "hono";
import type { User } from "../../../generated/prisma/client";
import type { CreateJadwalRequest, JadwalResponse, UpdateJadwalRequest } from "./jadwal.model";
import { JadwalService } from "./jadwal.service";

export class JadwalController {

    static async list(c: Context<{Variables: {user: User}}>) {
        const currentUser = c.get("user");
        const query = c.req.query();
        const response = await JadwalService.list(currentUser, query);
        return c.json(response, 200);
    }

    static async create(c: Context<{Variables: {user: User}}>) {
        const currentUser = c.get("user");
        const request: CreateJadwalRequest = await c.req.json();
        const response: JadwalResponse = await JadwalService.create(currentUser, request);
        return c.json({
            data: response
        }, 201)
    }

    static async update(c: Context<{Variables: {user:User}}>) {
        const currentUser = c.get("user");
        const id = Number(c.req.param("id"))
        const request: UpdateJadwalRequest = await c.req.json();
        const response: JadwalResponse = await JadwalService.update(currentUser, id, request);
        return c.json({
            data: response
        })
    }

    static async cancel(c: Context<{Variables: {user:User}}>) {
        const currentUser = c.get("user");
        const id = Number(c.req.param("id"));
        const response: string = await JadwalService.cancel(currentUser, id);
        return c.json({
            data: response
        })
    }

    static async undoCancel(c: Context<{Variables: {user: User}}>) {
        const currentUser = c.get("user");
        const id = Number(c.req.param("id"));
        const response: string = await JadwalService.undoCancel(currentUser, id);
        return c.json({ data: response });
    }
}