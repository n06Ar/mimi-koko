import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "@/server/trpc";

export const dashboardRouter = router({
  monthlyTotals: protectedProcedure
    .input(z.object({ familyId: z.string(), month: z.string() })) // YYYY-MM
    .query(async ({ ctx, input }) => {
      const member = await ctx.prisma.familyMember.findFirst({
        where: { familyId: input.familyId, userId: ctx.session.user.id },
      });
      if (!member) throw new TRPCError({ code: "FORBIDDEN" });

      const [year, month] = input.month.split("-").map(Number);
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0, 23, 59, 59);

      const family = await ctx.prisma.family.findUnique({
        where: { id: input.familyId },
        include: { members: true },
      });
      if (!family) throw new TRPCError({ code: "NOT_FOUND" });

      const memberIds = family.members.map((m) => m.userId);

      // 自分の支出（private 含む）+ 他人の非 private 支出
      const expenses = await ctx.prisma.expense.findMany({
        where: {
          date: { gte: start, lte: end },
          OR: [
            { userId: ctx.session.user.id },
            { userId: { in: memberIds }, isPrivate: false },
          ],
        },
      });

      const total = expenses.reduce((sum, e) => sum + e.amount, 0);
      const myTotal = expenses
        .filter((e) => e.userId === ctx.session.user.id)
        .reduce((sum, e) => sum + e.amount, 0);

      return { total, myTotal, count: expenses.length };
    }),

  categoryBreakdown: protectedProcedure
    .input(z.object({ familyId: z.string(), month: z.string() }))
    .query(async ({ ctx, input }) => {
      const member = await ctx.prisma.familyMember.findFirst({
        where: { familyId: input.familyId, userId: ctx.session.user.id },
      });
      if (!member) throw new TRPCError({ code: "FORBIDDEN" });

      const [year, month] = input.month.split("-").map(Number);
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0, 23, 59, 59);

      const family = await ctx.prisma.family.findUnique({
        where: { id: input.familyId },
        include: { members: true },
      });
      if (!family) throw new TRPCError({ code: "NOT_FOUND" });

      const memberIds = family.members.map((m) => m.userId);

      const breakdown = await ctx.prisma.expense.groupBy({
        by: ["category"],
        where: {
          date: { gte: start, lte: end },
          OR: [
            { userId: ctx.session.user.id },
            { userId: { in: memberIds }, isPrivate: false },
          ],
        },
        _sum: { amount: true },
        _count: true,
        orderBy: { _sum: { amount: "desc" } },
      });

      return breakdown.map((item) => ({
        category: item.category ?? "その他",
        total: item._sum.amount ?? 0,
        count: item._count,
      }));
    }),
});
