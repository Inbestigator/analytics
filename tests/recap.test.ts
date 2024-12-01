import { recap } from "@inbestigator/analytics";
import { assertEquals } from "@std/assert";

Deno.test(async function successfulRecap() {
  const recapped = await recap(["test"], {
    url: "http://localhost:8000/api/recap",
  });

  assertEquals(recapped instanceof Response, true);
  if (recapped instanceof Response && recapped.body) {
    console.log(await recapped.json());
  }
});

Deno.test(async function failRecap() {
  const recapped = await recap(["test"], {
    url: "http://localhost:3000/api/recap",
  });

  assertEquals(recapped instanceof Error, true);
  if (recapped instanceof Error) {
    assertEquals(recapped.message, "Failed to recap data");
  } else {
    throw new Error("Should be an error");
  }
});
