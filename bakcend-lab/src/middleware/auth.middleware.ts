import type { Context, Next } from "hono";
import { prisma } from "../../lib/prisma";
import { ResponseError } from "../error/response-error";
import type { User } from "../../generated/prisma/client";

export const authMiddleware = async (c: Context<{Variables: { user:User }}>, next: Next) => {
    const token = c.req.header("X-API-TOKEN");
    if(!token) throw new ResponseError(401, "Unauthorized");
    const user = await prisma.user.findFirst({where: {token}})
    if(!user) throw new ResponseError(401, "Unauthorized");
    c.set("user", user);
    await next()
}