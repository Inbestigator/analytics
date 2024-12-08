import { green, red } from "@std/fmt/colors";
import type CaptureClient from "./client.ts";

/**
 * Deletes a captured event.
 *
 * @param capture - The capture to delete.
 */
export default async function release(
  capture: string,
  options: {
    client: CaptureClient;
  },
): Promise<void> {
  try {
    const res = await fetch(
      `${options.client.url}/api/analytics/capture?id=${options.client.projectId}`,
      {
        method: "DELETE",
        body: JSON.stringify({
          capture,
        }),
        headers: {
          Authorization: options.client.key,
          "Content-Type": "application/json",
        },
      },
    );

    if (!res.ok) throw new Error(res.statusText);

    console.log(green("Released"), capture);

    res.body?.cancel();
  } catch (error) {
    console.error(red("Failed to release"), capture, error);
    throw new Error(`Failed to release "${capture}"`);
  }
}
