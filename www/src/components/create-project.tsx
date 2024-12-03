"use client";

import { useState } from "react";

import { api } from "@/trpc/react";

export function CreateProject() {
  const [projects] = api.project.getProjects.useSuspenseQuery();

  const utils = api.useUtils();
  const [name, setName] = useState("");
  const createPost = api.project.create.useMutation({
    onSuccess: async () => {
      await utils.project.invalidate();
      setName("");
    },
  });

  return (
    <div className="w-full max-w-xs">
      {projects.length > 0 ? (
        <p className="truncate">Your projects: {projects.map((p) => p.name)}</p>
      ) : (
        <p>You have no projects yet.</p>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          createPost.mutate({ name });
        }}
        className="flex flex-col gap-2"
      >
        <input
          type="text"
          placeholder="Title"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-full px-4 py-2 text-black"
        />
        <button
          type="submit"
          className="rounded-full bg-white/10 px-10 py-3 font-semibold transition hover:bg-white/20"
          disabled={createPost.isPending}
        >
          {createPost.isPending ? "Submitting..." : "Submit"}
        </button>
      </form>
    </div>
  );
}