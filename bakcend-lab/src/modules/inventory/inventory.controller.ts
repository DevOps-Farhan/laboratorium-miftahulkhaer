import type { Context } from "hono";
import type { CreateInventoryRequest, InventoryResponse, UpdateInvetoryRequest } from "./inventory.model";
import { InventoryService } from "./inventory.service";
import type { User } from "../../../generated/prisma/client";

export class InventoryController {

    static async list(c: Context<{Variables: {user: User}}>) {
        const currentUser = c.get("user");
        const query = c.req.query();
        const response = await InventoryService.list(currentUser, query);
        return c.json(response, 200);
    }

    static async create(c: Context<{Variables: {user: User}}>) {
        try {
            const currentUser = c.get("user");
            const request: CreateInventoryRequest = await c.req.json();
            const response: InventoryResponse = await InventoryService.create(currentUser, request);
            return c.json({ data: response }, 201);
        }catch(error) { throw error }
    }

    static async update(c: Context<{Variables: {user: User}}>) {
        const currentUser = c.get("user");
        const id = Number(c.req.param("id"));
        const body = await c.req.json();
        const request: UpdateInvetoryRequest = { ...body, id: id };
        const response: InventoryResponse = await InventoryService.update(currentUser, request);
        return c.json({ data: response }, 200);
    }

    static async delete(c: Context<{Variables: {user: User}}>) {
        const currentUser = c.get("user");
        const id = Number(c.req.param("id"));

        await InventoryService.delete(currentUser, id!);

        return c.json({ data: {data: "ok"} });
    }
}
