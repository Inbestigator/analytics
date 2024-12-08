import client from "./client.ts";

Deno.test(async function recapAndRelease() {
  const recapped = await client.recap(["test"]);

  if (recapped) {
    console.log(recapped);

    if (recapped.length > 0) {
      await client.release(recapped[0].id);
    }
  }
});
