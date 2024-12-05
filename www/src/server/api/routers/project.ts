import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { z } from "zod";

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
      await ctx.db.project.create({
        data: {
          name: input.name
            .toLowerCase()
            .replaceAll(/\s+/g, "-")
            .replaceAll(/[^a-z-]/g, ""),
          createdBy: { connect: { id: ctx.session.user.id } },
        },
      });
    }),
  generateKeys: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const existingKey = await ctx.db.key.findFirst({
        where: {
          projectId: input,
        },
      });
      if (existingKey) {
        throw new Error("Only one pair of keys per project!");
      }
      const { publicKey, privateKey } = await generateKeyPair();
      await ctx.db.key.createMany({
        data: [
          { projectId: input, key: publicKey, type: "PUBLIC" },
          { projectId: input, key: privateKey, type: "PRIVATE" },
        ],
      });
      return { publicKey, privateKey };
    }),
  getProjects: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.project.findMany({
      where: {
        createdById: ctx.session.user.id,
      },
      include: {
        keys: {
          take: 1,
          where: {
            type: "PUBLIC",
          },
        },
      },
    });
  }),

  delete: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      await ctx.db.project.delete({
        where: {
          id: input,
          createdById: ctx.session.user.id,
        },
      });
    }),
});
