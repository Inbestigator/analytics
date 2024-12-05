import { NextResponse, type NextRequest } from "next/server";
import authenticate from "../../authenticate";
import { db } from "@/server/db";
import type { InputJsonValue } from "@prisma/client/runtime/library";

export async function POST(req: NextRequest) {
  const authed = await authenticate(req, false);
  if (authed instanceof NextResponse) {
    return authed;
  }

  const data = (await req.json()) as {
    message: string;
    data?: InputJsonValue;
  };
  const id = req.nextUrl.searchParams.get("id");

  if (!id) {
    return new NextResponse("Missing id", { status: 400 });
  }

  if (!("message" in data)) {
    return new NextResponse("Missing message", { status: 400 });
  }

  const event = await db.event.findFirst({
    where: {
      name: data.message,
    },
    select: {
      id: true,
    },
  });

  if (!event) {
    return new NextResponse("Not a valid event", { status: 400 });
  }

  try {
    await db.capture.create({
      data: {
        projectId: id,
        name: data.message,
        data: data.data,
        eventId: event?.id,
      },
    });
    return new NextResponse(null, {
      status: 200,
    });
  } catch (err) {
    return new NextResponse(null, {
      status: 500,
      statusText: (err as Error).message,
    });
  }
}
