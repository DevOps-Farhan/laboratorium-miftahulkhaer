import "dotenv/config";
import { serve } from "@hono/node-server";
import app from "./src/index.ts";

const port = Number(process.env.PORT ?? 3000);

serve({ fetch: app.fetch, port });
console.log(`Hono (node) running at http://localhost:${port}`);
