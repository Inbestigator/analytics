import cuid from "cuid";
import { Application, Context, Next, Router } from "@oak/oak";
import { createClient } from "@libsql/client";
import "@std/dotenv/load";

async function generateKeyPair() {
  const keyPair = await crypto.subtle.generateKey(
    {
      name: "ECDSA",
      namedCurve: "P-256",
    },
    true,
    ["sign", "verify"],
  );
  const publicKey = await exportKeyAsString(keyPair.publicKey, "spki");
  const privateKey = await exportKeyAsString(keyPair.privateKey, "pkcs8");

  return {
    publicKey: "cak_u" + publicKey.substring(0, 64),
    privateKey: "cak_r" + privateKey.substring(0, 64),
  };
}

async function exportKeyAsString(key: CryptoKey, format: "spki" | "pkcs8") {
  const exported = await crypto.subtle.exportKey(format, key);
  return btoa(String.fromCharCode(...new Uint8Array(exported)));
}

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
    type TEXT NOT NULL CHECK (type IN ('public', 'private')),
    createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`);

await client.execute(`
  CREATE TABLE IF NOT EXISTS captures (
    id TEXT PRIMARY KEY,
    accountId TEXT NOT NULL REFERENCES accounts(id),
    message TEXT NOT NULL,
    data TEXT DEFAULT NULL CHECK (json_valid(data)),
    createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
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

router.get("/api/keypair", async (ctx) => {
  const id = ctx.request.url.searchParams.get("id") ?? "";

  if (!id) {
    ctx.response.body = "Missing id";
    ctx.response.status = 400;
    return;
  }

  try {
    const { rows } = await client.execute({
      sql: `SELECT * FROM keys WHERE accountId = ?`,
      args: [id],
    });

    if (rows.length > 0) {
      ctx.response.body = "Keys already exist for this account";
      ctx.response.status = 400;
      return;
    }

    const { publicKey, privateKey } = await generateKeyPair();

    await client.execute({
      sql: `INSERT INTO keys (id, key, accountId, type) VALUES (?, ?, ?, ?)`,
      args: [cuid(), publicKey, id, "public"],
    });

    await client.execute({
      sql: `INSERT INTO keys (id, key, accountId, type) VALUES (?, ?, ?, ?)`,
      args: [cuid(), privateKey, id, "private"],
    });

    ctx.response.status = 200;
    ctx.response.body = {
      publicKey,
      privateKey,
    };
  } catch (err) {
    console.error(err);
    ctx.response.status = 500;
    ctx.response.body = { error: (err as Error).message };
  }
});

router.post("/api/accounts", async (ctx) => {
  const data = await ctx.request.body.json();

  if (!("name" in data)) {
    ctx.response.body = "Missing name";
    ctx.response.status = 400;
    return;
  }

  try {
    const { rows } = await client.execute({
      sql: `SELECT * FROM accounts WHERE name = ?`,
      args: [data.name],
    });

    if (rows.length > 0) {
      ctx.response.body = "Account already exists";
      ctx.response.status = 400;
      return;
    }

    const id = cuid();

    await client.execute({
      sql: `INSERT INTO accounts (id, name) VALUES (?, ?)`,
      args: [id, data.name],
    });

    ctx.response.status = 200;
    ctx.response.body = {
      id,
      name: data.name,
    };
  } catch (err) {
    console.error(err);
    ctx.response.status = 500;
    ctx.response.body = { error: (err as Error).message };
  }
});

const app = new Application();
app.use(async (ctx, next) => {
  ctx.response.headers.set("Access-Control-Allow-Origin", "*");
  ctx.response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS",
  );
  ctx.response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, Accept",
  );
  ctx.response.headers.set("Access-Control-Allow-Credentials", "true");
  await next();
});
app.use(router.routes());
app.use(router.allowedMethods());

app.listen({ port: 8000 });
