import { green, red } from "@std/fmt/colors";

/**
 * Re-capture logs.
 *
 * @param options - Options for the recap.
 */
export default async function recap(
  messages: string[],
  options = {
    url: "https://analytics-h3.deno.dev/api/recap",
  },
): Promise<Response | Error> {
  try {
    const res = await fetch(
      options.url + `?messages=${encodeURIComponent(JSON.stringify(messages))}`,
      {
        method: "GET",
      },
    );

    if (!res.ok) throw new Error(res.statusText);

    console.log(green("Recapped data"));

    return res;
  } catch (error) {
    console.error(red("Failed to recap data"), error);

    return new Error("Failed to recap data");
  }
}
