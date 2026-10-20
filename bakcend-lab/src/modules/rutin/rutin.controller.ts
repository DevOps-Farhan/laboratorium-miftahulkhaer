import type { Context } from "hono";
import type { User } from "../../../generated/prisma/client";
import type { CreateRutinRequest, UpdateRutinRequest } from "./rutin.model";
import { RutinService } from "./rutin.service";

export class RutinController {
    static async list(c: Context<{ Variables: { user: User } }>) {
        const currentUser = c.get("user");
        const query = c.req.query();
        const response = await RutinService.list(currentUser, query);
        return c.json(response, 200);
    }

    static async create(c: Context<{ Variables: { user: User } }>) {
        const currentUser = c.get("user");
        const request: CreateRutinRequest = await c.req.json();
        const response = await RutinService.create(currentUser, request);
        return c.json({ data: response }, 201);
    }

    static async update(c: Context<{ Variables: { user: User } }>) {
        const currentUser = c.get("user");
        const id = Number(c.req.param("id"));
        const request: UpdateRutinRequest = await c.req.json();
        const response = await RutinService.update(currentUser, id, request);
        return c.json({ data: response });
    }

    static async remove(c: Context<{ Variables: { user: User } }>) {
        const currentUser = c.get("user");
        const id = Number(c.req.param("id"));
        const response: string = await RutinService.remove(currentUser, id);
        return c.json({ data: response });
    }
}
