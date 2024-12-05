"use client";

import { useState } from "react";

import { api } from "@/trpc/react";
import Input from "./ui/input";
import { Button } from "./ui/button";

export function CreateEvent({ id }: { id: string }) {
  const utils = api.useUtils();
  const [name, setName] = useState("");
  const addEvent = api.project.addEvent.useMutation({
    onSuccess: async () => {
      await utils.project.invalidate();
      setName("");
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        addEvent.mutate({ event: name, id });
      }}
      className="flex w-full gap-2"
    >
      <Input
        type="text"
        placeholder="Event name"
        value={name}
        onChange={(e) =>
          setName(
            e.target.value
              .replaceAll(/\s+/g, "-")
              .replaceAll(/[^a-zA-Z-]/g, ""),
          )
        }
      />
      <Button
        type="submit"
        disabled={addEvent.isPending || name.length < 1}
        className="w-fit"
      >
        {addEvent.isPending ? "Adding..." : "Add"}
      </Button>
    </form>
  );
}
