"use server";

import { signIn, signOut } from "@/server/auth";

export async function authAction(shouldLogout?: boolean) {
  if (shouldLogout) await signOut();
  else await signIn("github");
}
