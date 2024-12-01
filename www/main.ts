import { Application, Router } from "@oak/oak";
import { Database } from "@sqlitecloud/drivers";
import "@std/dotenv/load";

const db = new Database(Deno.env.get("DATABASE_URL") ?? "captures.db");

db.exec(`
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
  if (Array.isArray(messages) && messages.length > 0) {
    const captures = await db.sql`
      SELECT * FROM captures WHERE message IN (${messages});
    `;
    ctx.response.body = captures;
    return;
  }
  ctx.response.body = "No messages";
  ctx.response.status = 400;
});

router.post("/api/capture", async (ctx) => {
  const data = await ctx.request.body.json();

  if (!("message" in data)) {
    ctx.response.body = "Missing message";
    ctx.response.status = 400;
    return;
  }

  const result = await db.sql`
    INSERT INTO captures (message, data) VALUES (${data.message}, ${
    data.data ?? null
  });
  `;

  ctx.response.status = 200;
  ctx.response.body = result;
});

const app = new Application();
app.use(router.routes());
app.use(router.allowedMethods());

app.listen({ port: 8000 });
