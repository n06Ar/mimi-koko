import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "@/server/trpc";
import { calculateBalances, calculateSettlements } from "@/lib/settlement";

export const settlementRouter = router({
  list: protectedProcedure
    .input(z.object({ familyId: z.string() }))
    .query(async ({ ctx, input }) => {
      const member = await ctx.prisma.familyMember.findFirst({
        where: { familyId: input.familyId, userId: ctx.session.user.id },
      });
      if (!member) throw new TRPCError({ code: "FORBIDDEN" });

      return ctx.prisma.settlement.findMany({
        where: { familyId: input.familyId },
        include: {
          items: {
            include: {
              expense: { select: { storeName: true, amount: true, date: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const settlement = await ctx.prisma.settlement.findUnique({
        where: { id: input.id },
        include: {
          family: {
            include: {
              members: { include: { user: { select: { id: true, name: true } } } },
            },
          },
          items: {
            include: {
              expense: {
                select: { storeName: true, amount: true, date: true },
              },
            },
          },
        },
      });

      if (!settlement) throw new TRPCError({ code: "NOT_FOUND" });

      const isMember = settlement.family.members.some(
        (m) => m.userId === ctx.session.user.id
      );
      if (!isMember) throw new TRPCError({ code: "FORBIDDEN" });

      return settlement;
    }),

  create: protectedProcedure
    .input(
      z.object({
        familyId: z.string(),
        periodStart: z.string(), // ISO date
        periodEnd: z.string(), // ISO date
      })
    )
    .mutation(async ({ ctx, input }) => {
      const member = await ctx.prisma.familyMember.findFirst({
        where: { familyId: input.familyId, userId: ctx.session.user.id },
      });
      if (!member) throw new TRPCError({ code: "FORBIDDEN" });

      const periodStart = new Date(input.periodStart);
      const periodEnd = new Date(input.periodEnd);

      // 対象期間の支出を取得
      const family = await ctx.prisma.family.findUnique({
        where: { id: input.familyId },
        include: { members: true },
      });
      if (!family) throw new TRPCError({ code: "NOT_FOUND" });

      const memberIds = family.members.map((m) => m.userId);

      const expenses = await ctx.prisma.expense.findMany({
        where: {
          userId: { in: memberIds },
          date: { gte: periodStart, lte: periodEnd },
          isPrivate: false,
        },
        include: { expenseMembers: true },
      });

      const balances = calculateBalances(expenses);
      const transfers = calculateSettlements(balances);

      // 精算レコードを作成
      const settlement = await ctx.prisma.$transaction(async (tx) => {
        const newSettlement = await tx.settlement.create({
          data: {
            familyId: input.familyId,
            periodStart,
            periodEnd,
            status: "pending",
          },
        });

        // 精算アイテムは支出ごとに作成（transfers から生成）
        for (const transfer of transfers) {
          // 関連する支出を1つ代表として使う
          const relatedExpense = expenses.find(
            (e) => e.userId === transfer.toUserId
          );
          if (relatedExpense) {
            await tx.settlementItem.create({
              data: {
                settlementId: newSettlement.id,
                expenseId: relatedExpense.id,
                payerId: transfer.fromUserId,
                receiverId: transfer.toUserId,
                amount: transfer.amount,
              },
            });
          }
        }

        return newSettlement;
      });

      return settlement;
    }),

  complete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const settlement = await ctx.prisma.settlement.findUnique({
        where: { id: input.id },
        include: { family: { include: { members: true } } },
      });
      if (!settlement) throw new TRPCError({ code: "NOT_FOUND" });

      const isMember = settlement.family.members.some(
        (m) => m.userId === ctx.session.user.id
      );
      if (!isMember) throw new TRPCError({ code: "FORBIDDEN" });

      return ctx.prisma.settlement.update({
        where: { id: input.id },
        data: { status: "completed" },
      });
    }),
});
