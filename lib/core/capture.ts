import { green, red } from "@std/fmt/colors";
import type CaptureClient from "./client.ts";

/**
 * Captures a log message and sends it to analytics server.
 *
 * @param message - The message to capture.
 * @param options - Options for the capture.
 */
export default async function capture(
  message: string,
  options: {
    data?: Record<string | number | symbol, unknown>;
    client: CaptureClient;
  },
): Promise<void | Error> {
  try {
    const res = await fetch(
      `${options.client.url}/api/capture?id=${options.client.clientId}`,
      {
        method: "POST",
        body: JSON.stringify({
          message,
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

    console.log(green("Captured"), message);

    res.body?.cancel();
  } catch (error) {
    console.error(red("Failed to capture"), message, error);

    return new Error(`Failed to capture "${message}"`);
  }
}
