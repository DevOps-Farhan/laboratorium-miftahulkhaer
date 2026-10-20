import type { Context } from "hono";
import type { User } from "../../../generated/prisma/client";
import type { BookSlotRequest, CreateSlotRequest, UpdateSlotRequest } from "./slot.model";
import { SlotService } from "./slot.service";

export class SlotController {
    static async list(c: Context<{ Variables: { user: User } }>) {
        const currentUser = c.get("user");
        const query = c.req.query();
        const response = await SlotService.list(currentUser, query);
        return c.json(response, 200);
    }

    static async create(c: Context<{ Variables: { user: User } }>) {
        const currentUser = c.get("user");
        const request: CreateSlotRequest = await c.req.json();
        const response = await SlotService.create(currentUser, request);
        return c.json({ data: response }, 201);
    }

    static async update(c: Context<{ Variables: { user: User } }>) {
        const currentUser = c.get("user");
        const id = Number(c.req.param("id"));
        const request: UpdateSlotRequest = await c.req.json();
        const response = await SlotService.update(currentUser, id, request);
        return c.json({ data: response });
    }

    static async remove(c: Context<{ Variables: { user: User } }>) {
        const currentUser = c.get("user");
        const id = Number(c.req.param("id"));
        const response: string = await SlotService.remove(currentUser, id);
        return c.json({ data: response });
    }

    static async cancel(c: Context<{ Variables: { user: User } }>) {
        const currentUser = c.get("user");
        const id = Number(c.req.param("id"));
        const response: string = await SlotService.cancel(currentUser, id);
        return c.json({ data: response });
    }

    static async book(c: Context<{ Variables: { user: User } }>) {
        const currentUser = c.get("user");
        const id = Number(c.req.param("id"));
        const request: BookSlotRequest = await c.req.json().catch(() => ({}));
        const response = await SlotService.book(currentUser, id, request);
        return c.json({ data: response });
    }

    static async unbook(c: Context<{ Variables: { user: User } }>) {
        const currentUser = c.get("user");
        const id = Number(c.req.param("id"));
        const response: string = await SlotService.unbook(currentUser, id);
        return c.json({ data: response });
    }
}
