import client from "./client.ts";
import { assertEquals } from "@std/assert";

Deno.test(async function capture() {
  const captured = await client.capture("test", { a: 1, b: 2, c: 3 });

  assertEquals(captured instanceof Error, false);
});
