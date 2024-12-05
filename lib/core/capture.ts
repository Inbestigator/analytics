import { green, red } from "@std/fmt/colors";
import type CaptureClient from "./client.ts";

/**
 * Captures an event and sends it to the analytics server.
 *
 * @param event - The event to capture.
 * @param options - Options for the capture.
 */
export default async function capture(
  event: string,
  options: {
    data?: Record<string | number | symbol, unknown>;
    client: CaptureClient;
  },
): Promise<void | Error> {
  try {
    const res = await fetch(
      `${options.client.url}/api/analytics/capture?id=${options.client.clientId}`,
      {
        method: "POST",
        body: JSON.stringify({
          event,
          data: options.data,
          timestamp: new Date().toISOString(),
        }),
        headers: {
          Authorization: options.client.key,
          "Content-Type": "application/json",
        },
      },
    );

    if (!res.ok) throw new Error(res.statusText);

    console.log(green("Captured"), event);

    res.body?.cancel();
  } catch (error) {
    console.error(red("Failed to capture"), event, error);

    return new Error(`Failed to capture "${event}"`);
  }
}
