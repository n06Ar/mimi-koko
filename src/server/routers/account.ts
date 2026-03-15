import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "@/server/trpc";

const accountTypeEnum = z.enum([
  "credit_card",
  "bank_account",
  "e_money",
  "cash",
]);

export const accountRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.account.findMany({
      where: { userId: ctx.session.user.id },
      orderBy: { createdAt: "asc" },
    });
  }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        accountType: accountTypeEnum,
        providerName: z.string().optional(),
        last4Digits: z.string().length(4).optional(),
        billingDay: z.number().int().min(1).max(31).optional(),
        closingDay: z.number().int().min(1).max(31).optional(),
        isPrivate: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.account.create({
        data: { ...input, userId: ctx.session.user.id },
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        accountType: accountTypeEnum.optional(),
        providerName: z.string().optional(),
        last4Digits: z.string().length(4).optional(),
        billingDay: z.number().int().min(1).max(31).optional(),
        closingDay: z.number().int().min(1).max(31).optional(),
        isPrivate: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const account = await ctx.prisma.account.findUnique({ where: { id } });

      if (!account || account.userId !== ctx.session.user.id) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return ctx.prisma.account.update({ where: { id }, data });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const account = await ctx.prisma.account.findUnique({
        where: { id: input.id },
      });

      if (!account || account.userId !== ctx.session.user.id) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      await ctx.prisma.account.delete({ where: { id: input.id } });
      return { success: true };
    }),
});
