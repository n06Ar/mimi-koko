import { z } from "zod";
import { protectedProcedure, router } from "@/server/trpc";

export const userRouter = router({
  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.user.update({
        where: { id: ctx.session.user.id },
        data: input,
        select: { id: true, name: true, email: true },
      });
    }),

  me: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.user.findUnique({
      where: { id: ctx.session.user.id },
      select: { id: true, name: true, email: true, createdAt: true },
    });
  }),
});
