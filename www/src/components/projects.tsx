"use client";

import { api } from "@/trpc/react";
import ProjectDialog from "./project-dialog";

export function Projects() {
  const [projects] = api.project.getProjects.useSuspenseQuery();

  return (
    projects.length > 0 &&
    projects.map((project) => (
      <ProjectDialog
        key={project.id}
        project={project}
        events={project.events}
        publicKey={project.keys[0]?.key}
      />
    ))
  );
}
