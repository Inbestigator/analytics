import CaptureClient from "@capture/analytics";
import { assertEquals } from "@std/assert";

const client = new CaptureClient({
  clientId: "cm46gwoy20000f8uw0temaosh",
  publicKey: "cak_test",
  privateKey: "cak_test_private",
  url: "http://localhost:8000",
});

Deno.test(async function recap() {
  const recapped = await client.recap(["test"]);

  assertEquals(recapped instanceof Error, false);
  if (!(recapped instanceof Error)) {
    console.log(recapped);
  }
});
