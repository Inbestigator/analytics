import { type NextRequest, NextResponse } from "next/server";
import authenticate from "../../authenticate";
import { db } from "@/server/db";

export async function GET(req: NextRequest) {
  const authed = await authenticate(req);
  if (authed instanceof NextResponse) {
    return authed;
  }

  const events = JSON.parse(
    req.nextUrl.searchParams.get("events") ?? "[]",
  ) as string[];

  if (!events || !Array.isArray(events)) {
    return new NextResponse("Missing events", { status: 400 });
  }

  try {
    const captures = await db.capture.findMany({
      where: {
        projectId: authed.projectId,
        name: {
          in: events,
        },
      },
      select: {
        id: true,
        name: true,
        capturedAt: true,
        data: true,
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
