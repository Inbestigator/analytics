import CaptureClient from "@capture/analytics";
import "@std/dotenv/load";

export default new CaptureClient({
  projectId: Deno.env.get("TEST_PROJECT_ID") ?? "",
  key: Deno.env.get("TEST_PROJECT_KEY") ?? "",
  url: Deno.env.get("TEST_PROJECT_URL"),
});
