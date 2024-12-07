"use client";

import { api } from "@/trpc/react";
import { Dialog } from "./ui/dialog";
import { Button } from "./ui/button";
import { Text } from "./ui/text";
import type { Event } from "@prisma/client";
import Textarea from "./ui/textarea";
import { useState } from "react";

function parse(input: string): unknown {
  try {
    return JSON.parse(input);
  } catch {
    return input;
  }
}

export default function EventDialog({ event }: { event: Event }) {
  const utils = api.useUtils();
  if (event.schema) {
    event.schema = JSON.stringify(parse(event.schema as string), null, 2);
  }
  const [schema, setSchema] = useState(event.schema?.toString() ?? "");

  const saveSchema = api.project.setSchema.useMutation({
    onSuccess: async () => {
      await utils.project.invalidate();
    },
  });

  const deleteEvent = api.project.deleteEvent.useMutation({
    onSuccess: async () => {
      await utils.project.invalidate();
    },
  });

  return (
    <Dialog>
      <Dialog.Trigger asChild>
        <Button
          size="sm"
          className="flex w-full items-center justify-between text-start"
        >
          {event.name}
        </Button>
      </Dialog.Trigger>
      <Dialog.Content className="max-w-3xl">
        <Dialog.Header>
          <Text as="h5">{event.name}</Text>
        </Dialog.Header>
        <section className="flex flex-col gap-4 p-4">
          <Text as="h5">Schema</Text>
          <Textarea
            rows={8}
            value={schema}
            onChange={(e) => setSchema(e.target.value)}
            placeholder={`{
  name: "string",
  age: 0
}`}
          />
        </section>
        <Dialog.Footer>
          <Button
            variant="danger"
            disabled={deleteEvent.isPending}
            onClick={() => {
              if (confirm("Are you sure?")) {
                deleteEvent.mutate(event.id);
              }
            }}
          >
            {deleteEvent.isPending ? "Deleting..." : "Delete"}
          </Button>
          <Button
            disabled={saveSchema.isPending}
            onClick={() => {
              try {
                console.log(parse(schema));
                parse(schema);
              } catch (e) {
                console.log(e);
                alert("Your schema doesn't seem to be valid JSON!");
                return;
              }
              saveSchema.mutate({
                id: event.id,
                schema,
              });
            }}
          >
            {saveSchema.isPending ? "Saving..." : "Save"}
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
}
