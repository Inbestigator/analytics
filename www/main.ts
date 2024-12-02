import cuid from "cuid";
import { Application, Context, Next, Router } from "@oak/oak";
import { createClient } from "@libsql/client";
import "@std/dotenv/load";

const client = createClient({
  url: Deno.env.get("DATABASE_URL") ?? "",
  authToken: Deno.env.get("DATABASE_KEY") ?? "",
});

await client.execute(`
  CREATE TABLE IF NOT EXISTS accounts (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
  );
`);

await client.execute(`
  CREATE TABLE IF NOT EXISTS keys (
    id TEXT PRIMARY KEY,
    key TEXT NOT NULL UNIQUE,
    accountId TEXT NOT NULL REFERENCES accounts(id),
    type TEXT NOT NULL CHECK (type IN ('public', 'private'))
  );
`);

await client.execute(`
  CREATE TABLE IF NOT EXISTS captures (
    id TEXT PRIMARY KEY,
    accountId TEXT NOT NULL REFERENCES accounts(id),
    message TEXT NOT NULL,
    data TEXT DEFAULT NULL CHECK (json_valid(data))
  );
`);

const authenticate = async (
  ctx: Context,
  next: Next,
  enforcePrivate: boolean = true,
) => {
  const key = ctx.request.headers.get("authorization");
  const id = ctx.request.url.searchParams.get("id");

  if (!key || !id) {
    ctx.response.body = "Missing authorization or id";
    ctx.response.status = 401;
    return;
  }

  let sql = `SELECT * FROM keys WHERE key = ? AND accountId = ?`;

  if (enforcePrivate) {
    sql += " AND type = 'private'";
  }

  const { rows } = await client.execute({
    sql,
    args: [key, id],
  });

  if (rows.length === 0) {
    ctx.response.body = "Invalid authorization or id";
    ctx.response.status = 401;
    return;
  }

  await next();
};

const router = new Router();

router.get("/api/recap", authenticate, async (ctx) => {
  const params = ctx.request.url.searchParams;
  const messages = JSON.parse(params.get("messages") ?? "[]");
  const id = params.get("id") ?? "";

  if (!Array.isArray(messages) || messages.length === 0) {
    ctx.response.body = "No messages";
    ctx.response.status = 400;
    return;
  }

  const placeholders = messages.map(() => "?").join(",");

  try {
    const { rows } = await client.execute({
      sql:
        `SELECT * FROM captures WHERE accountId = ? AND message IN (${placeholders})`,
      args: [id, ...messages],
    });

    ctx.response.status = 200;
    ctx.response.body = rows;
  } catch (err) {
    console.error(err);
    ctx.response.status = 500;
    ctx.response.body = { error: (err as Error).message };
  }
});

router.post(
  "/api/capture",
  (ctx, next) => authenticate(ctx, next, false),
  async (ctx) => {
    const data = await ctx.request.body.json();
    const id = ctx.request.url.searchParams.get("id") ?? "";

    if (!("message" in data)) {
      ctx.response.body = "Missing message";
      ctx.response.status = 400;
      return;
    }

    try {
      await client.execute({
        sql:
          `INSERT INTO captures (id, accountId, message, data) VALUES (?, ?, ?, ?)`,
        args: [cuid(), id, data.message, JSON.stringify(data.data) ?? null],
      });

      ctx.response.status = 200;
      ctx.response.body = { success: true };
    } catch (err) {
      console.error(err);
      ctx.response.status = 500;
      ctx.response.body = { error: (err as Error).message };
    }
  },
);

const app = new Application();
app.use(async (ctx, next) => {
  ctx.response.headers.set("Access-Control-Allow-Origin", "*");
  await next();
});
app.use(router.routes());
app.use(router.allowedMethods());

app.listen({ port: 8000 });
