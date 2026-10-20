import type { Context } from "hono";
import type { User } from "../../../generated/prisma/client";
import type { CreateLaboratoriumRequest, LaboratoriumResponse, UpdateLaboratoriumRequest } from "./laboratorium.model";
import { LaboratoriumService } from "./laboratorium.service";

export class LaboratoriumController {

    static async list(c:Context<{Variables: {user: User}}>) {
        const currentUser = c.get("user");
        const query = c.req.query();
        const response = await LaboratoriumService.list(currentUser, query);
        return c.json(response);
    }

    static async create(c:Context<{Variables: {user: User}}>) {
        const currentUser = c.get("user");
        const request: CreateLaboratoriumRequest = await c.req.json();
        const response: LaboratoriumResponse = await LaboratoriumService.create(currentUser, request);
        return c.json({data: response});
    }

    static async update(c: Context<{Variables: {user:User}}>) {
        const currentUser = c.get("user");
        const id = Number(c.req.param("id"));
        const body = await c.req.json();
        const request: UpdateLaboratoriumRequest = { ...body, id: id }
        const response: LaboratoriumResponse = await LaboratoriumService.update(currentUser, request);
        return c.json({ data: response });
    }

    static async delete(c: Context<{Variables: {user: User}}>) {
        const currentUser = c.get("user");
        const id = Number(c.req.param("id"));
        const request = await LaboratoriumService.delete(currentUser, id!);
        return c.json({ data: request });
    }
}