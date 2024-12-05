"use client";

import { useState } from "react";

import { api } from "@/trpc/react";
import Input from "./ui/input";
import { Button } from "./ui/button";

export function CreateProject() {
  const utils = api.useUtils();
  const [name, setName] = useState("");
  const createPost = api.project.create.useMutation({
    onSuccess: async () => {
      await utils.project.invalidate();
      setName("");
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        createPost.mutate({ name });
      }}
      className="flex w-full max-w-xl gap-2"
    >
      <Input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) =>
          setName(
            e.target.value
              .toLowerCase()
              .replaceAll(/\s+/g, "-")
              .replaceAll(/[^a-z-]/g, ""),
          )
        }
      />
      <Button
        type="submit"
        disabled={createPost.isPending || name.length < 1}
        className="w-fit"
      >
        {createPost.isPending ? "Creating..." : "Create"}
      </Button>
    </form>
  );
}
