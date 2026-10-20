import { rateLimiter } from "hono-rate-limiter";

async function loginKey(c: any): Promise<string> {
  const ip = c.req.header("x-forwarded-for") ?? "unknown";
  try {
    const body = await c.req.raw.clone().json();
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    if (email) return `${email}|${ip}`;
  } catch {
    // Body bukan JSON valid — jatuh ke kunci IP saja agar limiter tetap jalan.
  }
  return ip;
}

export const loginRateLimiter = rateLimiter({
  windowMs: 60 * 1000,
  limit: 5,
  standardHeaders: "draft-6",
  keyGenerator: loginKey,
});