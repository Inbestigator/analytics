import { auth } from "@/server/auth";
import { api, HydrateClient } from "@/trpc/server";
import { CreateProject } from "@/components/create-project";
import AuthButton from "@/components/auth-button";
import { Projects } from "@/components/projects";
import { Text } from "@/components/ui/text";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Wires from "@/components/wires";

export default async function Home() {
  const session = await auth();

  if (session?.user) {
    void api.project.getProjects.prefetch();
  }

  return (
    <HydrateClient>
      {!session?.user && (
        <>
          <main className="-my-4 flex min-h-dvh flex-col justify-center gap-4">
            <Text as="h1">Capture</Text>
            <Text as="h3">Analytics for the good ones</Text>
            <div className="flex gap-4">
              <AuthButton
                defaultContent="Sign in"
                pendingContent="Signing in"
              />
              <Link target="_blank" href="https://jsr.io/@capture/analytics">
                <Button variant="outline">JSR</Button>
              </Link>
            </div>
          </main>
          <div className="absolute inset-0 -z-50 hidden overflow-hidden lg:block">
            <Wires className="absolute -bottom-16 -right-16 -rotate-12 scale-150" />
          </div>
        </>
      )}
      {session?.user && (
        <main className="flex flex-col items-center gap-4">
          <CreateProject />
          <Suspense>
            <Projects />
          </Suspense>
        </main>
      )}
    </HydrateClient>
  );
}
