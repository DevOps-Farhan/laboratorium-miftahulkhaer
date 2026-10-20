import app from "./src";

const port = Number(process.env.PORT ?? 3000);
export default {
  port,
  fetch: app.fetch,
};
console.log(`Hono running at http://localhost:${port}`);