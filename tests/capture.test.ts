import client from "./client.ts";

Deno.test(async function capture() {
  await client.capture("test", { a: 1, b: 2, c: 3 });
});
