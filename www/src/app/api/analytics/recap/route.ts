import { NextResponse, type NextRequest } from "next/server";
import authenticate from "../../authenticate";
import { db } from "@/server/db";

export async function GET(req: NextRequest) {
  const authed = await authenticate(req);
  if (authed instanceof NextResponse) {
    return authed;
  }

  const id = req.nextUrl.searchParams.get("id");
  const messages = JSON.parse(
    req.nextUrl.searchParams.get("messages") ?? "[]",
  ) as string[];

  if (!id) {
    return new NextResponse("Missing id", { status: 400 });
  }

  if (!messages || !Array.isArray(messages)) {
    return new NextResponse("Missing messages", { status: 400 });
  }

  try {
    const captures = await db.capture.findMany({
      where: {
        projectId: id,
        name: {
          in: messages,
        },
      },
    });
    return new NextResponse(JSON.stringify(captures), {
      status: 200,
    });
  } catch (err) {
    return new NextResponse(null, {
      status: 500,
      statusText: (err as Error).message,
    });
  }
}
