import type { Context } from "hono";
import type { User } from "../../../generated/prisma/client";
import type { CreateUsersRequest, UpdateUsersRequest, UsersResponse } from "./users.model";
import { UsersService } from "./users.service";

export class UsersController {

    static async list(c: Context<{Variables: {user: User}}>) {
        const currentUser = c.get("user");
        const query = c.req.query();
        const response = await UsersService.list(currentUser, query);
        return c.json(response);
    }

    static async create(c:Context<{Variables: {user: User}}>) {
        const currentUser = c.get("user");
        const request : CreateUsersRequest = await c.req.json();
        const response: UsersResponse = await UsersService.create(currentUser, request);
        return c.json({ data: response });
    }

    static async update(c:Context<{Variables: {user:User}}>) {
        const currentUser = c.get("user");
        const id = Number(c.req.param("id"));
        const request: UpdateUsersRequest = await c.req.json()
        const response: UsersResponse = await UsersService.update(currentUser, id, request);
        return c.json(response);
    }

    static async delete(c: Context<{Variables: {user: User}}>) {
        const currentUser = c.get("user");
        const id = Number(c.req.param("id"));
        const result = await UsersService.delete(currentUser, id);
        return c.json({ data: result });
    }
}