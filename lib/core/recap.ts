import { green, red } from "@std/fmt/colors";
import type CaptureClient from "./client.ts";

/**
 * Re-capture logs.
 *
 * @param messages - The messages to look up.
 * @param options - Options for the recap.
 */
export default async function recap(
  messages: string[],
  options: {
    client: CaptureClient;
    key: string;
  },
): Promise<unknown | Error> {
  try {
    const res = await fetch(
      `${options.client.url}/api/recap?id=${options.client.clientId}&messages=${
        encodeURIComponent(JSON.stringify(messages))
      }`,
      {
        method: "GET",
        headers: {
          Authorization: options.key,
        },
      },
    );

    if (!res.ok) throw new Error(res.statusText);

    console.log(green("Recapped data"));

    return res.json();
  } catch (error) {
    console.error(red("Failed to recap data"), error);

    return new Error("Failed to recap data");
  }
}
