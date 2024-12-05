"use client";

import { api } from "@/trpc/react";
import { useState } from "react";
import { Dialog } from "./ui/dialog";
import { Button } from "./ui/button";
import { Text } from "./ui/text";
import type { Event, Project } from "@prisma/client";
import { Copy, CopyCheck, Key } from "lucide-react";
import { useRouter } from "next/navigation";
import { CreateEvent } from "./create-event";

export default function ProjectDialog({
  project,
  events,
  publicKey,
}: {
  project: Project;
  events: Event[];
  publicKey?: string;
}) {
  const utils = api.useUtils();
  const [isFirst, setIsFirst] = useState(false);
  const [keys, setKeys] = useState<{
    publicKey?: string;
    privateKey?: string;
  }>({ publicKey });
  const router = useRouter();
  const [copiedKey, setCopiedKey] = useState("none");

  const generateKeys = api.project.generateKeys.useMutation({
    onSuccess: async (data) => {
      await utils.project.invalidate();
      setIsFirst(true);
      setKeys(data);
    },
  });

  const deleteProject = api.project.delete.useMutation({
    onSuccess: async () => {
      await utils.project.invalidate();
      router.refresh();
    },
  });

  return (
    <Dialog>
      <Dialog.Trigger asChild>
        <Button className="flex w-full max-w-xl items-center justify-between text-start">
          {project.name}
          {publicKey && <Key />}
        </Button>
      </Dialog.Trigger>
      <Dialog.Content className="max-w-3xl">
        <Dialog.Header>
          <Text as="h5">{project.name}</Text>
        </Dialog.Header>
        <section className="flex flex-col gap-4 p-4">
          <Text as="h5">Project data</Text>
          <Text>Project ID: {project.id}</Text>
          {keys.publicKey && (
            <>
              <Text>
                Public key: {keys.publicKey}
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    void navigator.clipboard.writeText(keys.publicKey ?? "");
                    setCopiedKey("public");
                  }}
                  className="ml-2"
                >
                  {copiedKey === "public" ? (
                    <CopyCheck className="size-4" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                </Button>
              </Text>
              {isFirst && (
                <>
                  <Text>
                    Private key: {keys.privateKey}
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        void navigator.clipboard.writeText(
                          keys.privateKey ?? "",
                        );
                        setCopiedKey("private");
                      }}
                      className="ml-2"
                    >
                      {copiedKey === "private" ? (
                        <CopyCheck className="size-4" />
                      ) : (
                        <Copy className="size-4" />
                      )}
                    </Button>
                  </Text>
                  <Text className="text-base text-black/50">
                    This key will not be shown again!
                  </Text>
                </>
              )}
            </>
          )}
          {!keys.publicKey && (
            <Button
              disabled={generateKeys.isPending}
              onClick={() => generateKeys.mutate(project.id)}
              className="w-fit"
            >
              {generateKeys.isPending ? "Generating keys..." : "Generate keys"}
            </Button>
          )}
        </section>
        <section className="flex flex-col gap-4 p-4">
          <Text as="h5">Events</Text>
          {events.map((event) => (
            <Text
              key={event.id}
              className="w-fit cursor-pointer transition-all hover:text-red-500"
            >
              {event.name}
            </Text>
          ))}
          <CreateEvent id={project.id} />
        </section>
        <Dialog.Footer>
          <Button
            variant="danger"
            disabled={deleteProject.isPending}
            onClick={() => {
              if (confirm("Are you sure?")) {
                deleteProject.mutate(project.id);
              }
            }}
          >
            {deleteProject.isPending ? "Deleting..." : "Delete"}
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
}