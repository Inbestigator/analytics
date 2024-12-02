import CaptureClient from "@capture/analytics";
import { assertEquals } from "@std/assert";

const client = new CaptureClient({
  clientId: "test",
  publicKey: "test",
  privateKey: "test",
  url: "http://localhost:8000",
});

Deno.test(async function capture() {
  const captured = await client.capture("test", { a: 1, b: 2, c: 3 });

  assertEquals(captured instanceof Error, false);
});
