import { green, red } from "@std/fmt/colors";
import type CaptureClient from "./client.ts";

export interface RecappedEvent {
  id: string;
  name: string;
  capturedAt: Date;
  data: unknown | null;
}

/**
 * Re-capture events.
 *
 * @param events - The events to look up.
 * @param options - Options for the recap.
 */
export default async function recap(
  events: string[],
  options: {
    client: CaptureClient;
  },
): Promise<RecappedEvent[]> {
  try {
    const res = await fetch(
      `${options.client.url}/api/analytics/recap?id=${options.client.projectId}&events=${
        encodeURIComponent(JSON.stringify(events))
      }`,
      {
        method: "GET",
        headers: {
          Authorization: options.client.key,
        },
      },
    );

    if (!res.ok) throw new Error(res.statusText);

    console.log(green("Recapped"), events.join(", "));

    return await res.json();
  } catch (error) {
    console.error(red("Failed to recap data"), error);
    throw new Error(`Failed to recap ${events.join(", ")}`);
  }
}
