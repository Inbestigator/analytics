import { green, red } from "@std/fmt/colors";

/**
 * Captures a log message and sends it to analytics server.
 *
 * @param message - The message to capture.
 * @param data - Optional data to include with the message.
 * @param options - Options for the capture.
 */
export default async function capture(
  message: string,
  data?: Record<string | number | symbol, unknown>,
  options = {
    url: "https://analytics-h3.deno.dev/api/capture",
  },
): Promise<Response | Error> {
  try {
    const res = await fetch(options.url, {
      method: "POST",
      body: JSON.stringify({
        message,
        data,
        timestamp: new Date().toISOString(),
      }),
    });

    if (!res.ok) throw new Error(res.statusText);

    console.log(green("Captured"), message);

    return res;
  } catch (error) {
    console.error(red("Failed to capture"), message, error);

    return new Error(`Failed to capture "${message}"`);
  }
}
