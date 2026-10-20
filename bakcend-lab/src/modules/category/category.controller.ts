import type { Context } from "hono";
import type { User } from "../../../generated/prisma/client";
import type { CreateCategoryRequest, UpdateCategoryRequest } from "./category.model";
import { CategoryService } from "./category.service";

export class CategoryController {

    static async list(c: Context<{Variables: {user: User}}>) {
        const currentUser = c.get("user");
        const query = c.req.query();
        const response = await CategoryService.list(currentUser, query);
        return c.json(response, 200);
    }

    static async create(c: Context<{Variables: {user: User}}>) {
        const currentUser = c.get("user");
        const request: CreateCategoryRequest = await c.req.json();
        const response = await CategoryService.create(currentUser, request);
        return c.json({ data: response }, 201);
    }

    static async update(c: Context<{Variables: {user: User}}>) {
        const currentUser = c.get("user");
        const id = Number(c.req.param("id"));
        const body = await c.req.json();
        const request: UpdateCategoryRequest = { ...body, id: id };
        const response = await CategoryService.update(currentUser, request);
        return c.json({ data: response }, 200);
    }

    static async delete(c: Context<{Variables: {user: User}}>) {
        const currentUser = c.get("user");
        const id = Number(c.req.param("id"));
        const result = await CategoryService.delete(currentUser, id);
        return c.json({ data: result }, 200);
    }
}
