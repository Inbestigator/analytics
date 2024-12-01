import { green, red } from "@std/fmt/colors";

/**
 * Re-capture logs.
 *
 * @param options - Options for the recap.
 */
export default async function recap(
  messages: string[],
  options = {
    url: "https://capture-analytics.deno.dev/api/recap",
  },
): Promise<unknown | Error> {
  try {
    const res = await fetch(
      options.url + `?messages=${encodeURIComponent(JSON.stringify(messages))}`,
      {
        method: "GET",
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
