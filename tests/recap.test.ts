import CaptureClient from "@capture/analytics";
import { assertEquals } from "@std/assert";

const client = new CaptureClient({
  clientId: "test",
  publicKey: "test",
  privateKey: "test",
  url: "http://localhost:8000",
});

Deno.test(async function recap() {
  const recapped = await client.recap(["test"]);

  assertEquals(recapped instanceof Error, false);
  if (!(recapped instanceof Error)) {
    console.log(recapped);
  }
});
