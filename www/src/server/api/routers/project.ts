import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
} from "@/server/api/trpc";
import { keys, projects } from "@/server/db/schema";

async function generateKeyPair() {
  const keyPair = await crypto.subtle.generateKey(
    {
      name: "ECDSA",
      namedCurve: "P-256",
    },
    true,
    ["sign", "verify"],
  );
  const publicKey = await exportKeyAsString(keyPair.publicKey, "spki");
  const privateKey = await exportKeyAsString(keyPair.privateKey, "pkcs8");

  return {
    publicKey: "cak_u" + publicKey.substring(0, 64),
    privateKey: "cak_r" + privateKey.substring(0, 64),
  };
}

async function exportKeyAsString(key: CryptoKey, format: "spki" | "pkcs8") {
  const exported = await crypto.subtle.exportKey(format, key);
  return btoa(String.fromCharCode(...new Uint8Array(exported)));
}

export const projectRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(projects).values({
        name: input.name,
        createdById: ctx.session.user.id,
      });
    }),
  generateKeys: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const { publicKey, privateKey } = await generateKeyPair();
      await ctx.db.transaction(async (tx) => {
        await tx.insert(keys).values({
          projectId: input,
          key: privateKey,
          type: "public",
        });

        await tx.insert(keys).values({
          projectId: input,
          key: publicKey,
          type: "private",
        });
      });
      return { publicKey, privateKey };
    }),
  getProjects: protectedProcedure.query(async ({ ctx }) => {
    const projects = await ctx.db.query.projects.findMany({
      orderBy: (projects, { desc }) => [desc(projects.createdAt)],
    });

    return projects;
  }),
});
