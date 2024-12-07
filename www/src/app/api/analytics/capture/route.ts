import { type NextRequest, NextResponse } from "next/server";
import authenticate from "../../authenticate";
import { db } from "@/server/db";
import type { InputJsonValue } from "@prisma/client/runtime/library";
import { isDeepStrictEqual } from "util";

export type Schema =
  | { type: "string" | "number" | "boolean" | "null" }
  | { type: "object"; items: Record<string, Schema> }
  | { type: "array"; items: Schema[] };

function generateSchema(json: unknown): Schema {
  if (json === null) return { type: "null" };
  switch (typeof json) {
    case "string": {
      return { type: "string" };
    }
    case "number": {
      return { type: "number" };
    }
    case "boolean": {
      return { type: "boolean" };
    }
    case "object": {
      if (Array.isArray(json)) {
        return { type: "array", items: json.map(generateSchema) };
      }
      return {
        type: "object",
        items: Object.fromEntries(
          Object.entries(json).map(([key, value]) => [
            key,
            generateSchema(value),
          ]),
        ),
      };
    }
    default: {
      return { type: "null" };
    }
  }
}

export async function POST(req: NextRequest) {
  const authed = await authenticate(req, false);
  if (authed instanceof NextResponse) {
    return authed;
  }

  const data = (await req.json()) as {
    event: string;
    data?: InputJsonValue;
  };
  const id = req.nextUrl.searchParams.get("id");

  if (!id) {
    return new NextResponse("Missing id", { status: 400 });
  }

  if (!("event" in data)) {
    return new NextResponse("Missing event", { status: 400 });
  }

  const event = await db.event.findFirst({
    where: {
      name: data.event,
    },
    select: {
      id: true,
      schema: true,
    },
  });

  if (!event) {
    return new NextResponse("Not a valid event", { status: 400 });
  }

  if (
    event.schema &&
    !isDeepStrictEqual(generateSchema(data.data), generateSchema(event.schema))
  ) {
    return new NextResponse("Data does not match schema", { status: 400 });
  }

  try {
    await db.capture.create({
      data: {
        projectId: id,
        name: data.event,
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
