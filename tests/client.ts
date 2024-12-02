import CaptureClient from "@capture/analytics";
import "@std/dotenv/load";

export default new CaptureClient({
  clientId: Deno.env.get("TEST_CLIENT_ID") ?? "",
  publicKey: Deno.env.get("TEST_CLIENT_PUBLIC_KEY") ?? "",
  privateKey: Deno.env.get("TEST_CLIENT_PRIVATE_KEY") ?? "",
  url: Deno.env.get("TEST_CLIENT_URL"),
});
