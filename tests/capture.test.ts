import { capture } from "@capture/analytics";
import { assertEquals } from "@std/assert";

Deno.test(async function successfulCapture() {
  const captured = await capture("test", undefined, {
    url: "http://localhost:8000/api/capture",
  });

  assertEquals(captured instanceof Error, false);
});

Deno.test(async function failCapture() {
  const captured = await capture(
    "test",
    { a: 1, b: 2, c: 3 },
    {
      url: "http://localhost:3000/api/capture",
    },
  );

  assertEquals(captured instanceof Error, true);

  if (captured instanceof Error) {
    assertEquals(captured.message, 'Failed to capture "test"');
  } else {
    throw new Error("Should be an error");
  }
});
