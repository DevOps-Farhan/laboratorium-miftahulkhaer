import { Hono } from "hono";
import { UserConntroller } from "../modules/users/user.controller";
import { loginRateLimiter } from "../middleware/rate-limitter.middleware";

const publicApi = new Hono();

publicApi.post('/api/users/login', loginRateLimiter, UserConntroller.login);

export {publicApi}