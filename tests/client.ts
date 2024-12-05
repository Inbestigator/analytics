import CaptureClient from "@capture/analytics";
import "@std/dotenv/load";

export default new CaptureClient({
  clientId: Deno.env.get("TEST_CLIENT_ID") ?? "",
  key: Deno.env.get("TEST_CLIENT_KEY") ?? "",
  url: Deno.env.get("TEST_CLIENT_URL") ??
    "https://capture-analytics.vercel.app",
});
