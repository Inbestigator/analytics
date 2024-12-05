import { db } from "@/server/db";
import { type NextRequest, NextResponse } from "next/server";

export default async function authenticate(
  req: NextRequest,
  enforcePrivate = true,
) {
  const key = req.headers.get("authorization");
  const projectId = req.nextUrl.searchParams.get("id");

  if (!key || !projectId) {
    return new NextResponse("Missing authorization or project id", {
      status: 401,
    });
  }

  const keyInDB = await db.key.findFirst({
    where: {
      projectId,
      key,
      type: enforcePrivate
        ? "PRIVATE"
        : {
            in: ["PRIVATE", "PUBLIC"],
          },
    },
  });

  if (!keyInDB) {
    return new NextResponse("Invalid authorization or id", { status: 401 });
  }

  return;
}
