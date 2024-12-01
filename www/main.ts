import { Application, Router } from "@oak/oak";

const db = await Deno.openKv();

const router = new Router();

router.get("/api/recap", async (ctx) => {
  const params = ctx.request.url.searchParams;
  const messages = JSON.parse(params.get("messages") ?? "[]");
  if (Array.isArray(messages) && messages.length > 0) {
    const iter = db.list({
      start: ["capture"],
      end: messages,
    });
    const captures = [];
    for await (const res of iter) captures.push(res);
    ctx.response.body = captures;
    return;
  }
  ctx.response.body = "No messages";
  ctx.response.status = 400;
});

router.post("/api/capture", async (ctx) => {
  const data = await ctx.request.body.json();
  db.atomic()
    .set(["capture", data.message, crypto.randomUUID()], data.data)
    .commit();

  ctx.response.status = 200;
});

const app = new Application();
app.use(router.routes());
app.use(router.allowedMethods());

app.listen({ port: 8000 });
