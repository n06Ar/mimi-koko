import { z } from "zod";
import bcrypt from "bcryptjs";
import { TRPCError } from "@trpc/server";
import { publicProcedure, router } from "@/server/trpc";

export const authRouter = router({
  signup: publicProcedure
    .input(
      z.object({
        name: z.string().min(1),
        email: z.string().email(),
        password: z.string().min(8),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.prisma.user.findUnique({
        where: { email: input.email },
      });

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "このメールアドレスはすでに登録されています",
        });
      }

      const passwordHash = await bcrypt.hash(input.password, 12);

      const user = await ctx.prisma.user.create({
        data: {
          name: input.name,
          email: input.email,
          passwordHash,
        },
        select: { id: true, name: true, email: true },
      });

      return user;
    }),
});
