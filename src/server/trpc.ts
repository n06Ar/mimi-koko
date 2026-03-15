import { TRPCError, initTRPC } from "@trpc/server";
import type { Session } from "next-auth";
import type { Context } from "./context";

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;

type AuthenticatedSession = Session & {
  user: NonNullable<Session["user"]> & { id: string };
};

const isAuthenticated = t.middleware(({ ctx, next }) => {
  if (!ctx.session?.user?.id) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      ...ctx,
      session: ctx.session as AuthenticatedSession,
    },
  });
});

export const protectedProcedure = t.procedure.use(isAuthenticated);
export const createCallerFactory = t.createCallerFactory;
