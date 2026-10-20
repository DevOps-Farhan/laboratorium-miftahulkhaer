import type { Context, Next } from "hono";
import { Roles } from "../../generated/prisma/enums";
import { ResponseError } from "../error/response-error";
import type { User } from "../../generated/prisma/client";

export const roleMiddleware = (...allowed: Roles[]) => {
    return async (c: Context<{Variables: {user: User}}>, next:Next) => {
        const user = c.get("user");
        if(!user) throw new ResponseError(401, "Unauthorized");
        if(user.status !== "aktif") throw new ResponseError(403, "User nonaktif");
        if(!allowed.includes(user.role)) throw new ResponseError(403, `Forbidden: need ${allowed.join("/")}`);
        await next();
    };
};