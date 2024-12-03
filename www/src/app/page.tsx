import { CreateProject } from "@/components/create-project";
import { auth } from "@/server/auth";
import { api, HydrateClient } from "@/trpc/server";
import AuthButton from "@/components/auth-button";

export default async function Home() {
  const session = await auth();

  if (session?.user) {
    void api.project.getProjects.prefetch();
  }

  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
          {session?.user && <CreateProject />}
          {!session?.user && (
            <AuthButton shouldLogout={false} />
          )}
      </main>
    </HydrateClient>
  );
}
