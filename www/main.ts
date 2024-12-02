import { Application, Router } from "@oak/oak";
import { createClient } from "@libsql/client";
import "@std/dotenv/load";

const client = createClient({
  url: Deno.env.get("DATABASE_URL") ?? "",
  authToken: Deno.env.get("DATABASE_KEY") ?? "",
});

await client.execute(`
  CREATE TABLE IF NOT EXISTS captures (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  message TEXT NOT NULL,
  data TEXT DEFAULT NULL CHECK (json_valid(data))
  );
`);

const router = new Router();

router.get("/api/recap", async (ctx) => {
  const params = ctx.request.url.searchParams;
  const messages = JSON.parse(params.get("messages") ?? "[]");

  if (!Array.isArray(messages) || messages.length === 0) {
    ctx.response.body = "No messages";
    ctx.response.status = 400;
    return;
  }

  const placeholders = messages.map(() => "?").join(",");

  try {
    const { rows } = await client.execute({
      sql: `SELECT * FROM captures WHERE message IN (${placeholders})`,
      args: messages,
    });

    ctx.response.status = 200;
    ctx.response.body = rows;
  } catch (err) {
    console.error(err);
    ctx.response.status = 500;
    ctx.response.body = { error: (err as Error).message };
  }
});

router.post("/api/capture", async (ctx) => {
  const data = await ctx.request.body.json();

  if (!("message" in data)) {
    ctx.response.body = "Missing message";
    ctx.response.status = 400;
    return;
  }

  try {
    await client.execute({
      sql: `INSERT INTO captures (message, data) VALUES (?, ?)`,
      args: [data.message, JSON.stringify(data.data) ?? null],
    });

    ctx.response.status = 200;
    ctx.response.body = { success: true };
  } catch (err) {
    console.error(err);
    ctx.response.status = 500;
    ctx.response.body = { error: (err as Error).message };
  }
});

const app = new Application();
app.use(router.routes());
app.use(router.allowedMethods());

app.listen({ port: 8000 });
