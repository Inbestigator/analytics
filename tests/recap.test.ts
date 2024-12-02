import { assertEquals } from "@std/assert";
import client from "./client.ts";

Deno.test(async function recap() {
  const recapped = await client.recap(["test"]);

  assertEquals(recapped instanceof Error, false);
  if (!(recapped instanceof Error)) {
    console.log(recapped);
  }
});
