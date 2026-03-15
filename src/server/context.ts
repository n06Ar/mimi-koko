import { auth } from "@/auth";
import { prisma } from "@/libs/prisma";
import type { Session } from "next-auth";

export interface Context {
  prisma: typeof prisma;
  session: Session | null;
}

export async function createContext(): Promise<Context> {
  const session = await auth();
  return {
    prisma,
    session,
  };
}
