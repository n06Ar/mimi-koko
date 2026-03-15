import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "@/server/trpc";
import { classifyExpenseCategory } from "@/lib/ollama";

export const expenseRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        month: z.string().optional(), // YYYY-MM
        familyId: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const where: Record<string, unknown> = {};

      if (input.familyId) {
        // ファミリーの支出一覧（自分の private は含む、他人の private は除く）
        const member = await ctx.prisma.familyMember.findFirst({
          where: { familyId: input.familyId, userId: ctx.session.user.id },
        });
        if (!member) throw new TRPCError({ code: "FORBIDDEN" });

        where.OR = [
          { userId: ctx.session.user.id },
          { isPrivate: false },
        ];
      } else {
        where.userId = ctx.session.user.id;
      }

      if (input.month) {
        const [year, month] = input.month.split("-").map(Number);
        const start = new Date(year, month - 1, 1);
        const end = new Date(year, month, 0, 23, 59, 59);
        where.date = { gte: start, lte: end };
      }

      return ctx.prisma.expense.findMany({
        where,
        include: {
          user: { select: { id: true, name: true } },
          account: { select: { id: true, name: true } },
          expenseMembers: {
            include: { user: { select: { id: true, name: true } } },
          },
        },
        orderBy: { date: "desc" },
      });
    }),

  create: protectedProcedure
    .input(
      z.object({
        amount: z.number().int().positive(),
        storeName: z.string().optional(),
        date: z.string(), // ISO date string
        accountId: z.string().optional(),
        isPrivate: z.boolean().default(false),
        memberIds: z.array(z.string()).optional(), // 分担するメンバーのID
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { memberIds, ...rest } = input;

      const expense = await ctx.prisma.$transaction(async (tx) => {
        const newExpense = await tx.expense.create({
          data: {
            ...rest,
            date: new Date(rest.date),
            userId: ctx.session.user.id,
          },
        });

        // private でない場合はメンバーを記録
        if (!input.isPrivate && memberIds && memberIds.length > 0) {
          await tx.expenseMember.createMany({
            data: memberIds.map((userId) => ({
              expenseId: newExpense.id,
              userId,
            })),
          });
        }

        return newExpense;
      });

      // Ollama でカテゴリ分類（非同期・失敗しても保存は維持）
      if (input.storeName && !input.isPrivate) {
        classifyExpenseCategory(input.storeName, input.amount)
          .then((category) => {
            if (category) {
              return ctx.prisma.expense.update({
                where: { id: expense.id },
                data: { category },
              });
            }
          })
          .catch(() => {
            // Ollama が失敗してもエラーを無視
          });
      }

      return expense;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        amount: z.number().int().positive().optional(),
        storeName: z.string().optional(),
        date: z.string().optional(),
        accountId: z.string().optional(),
        isPrivate: z.boolean().optional(),
        category: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, date, ...data } = input;
      const expense = await ctx.prisma.expense.findUnique({ where: { id } });

      if (!expense || expense.userId !== ctx.session.user.id) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return ctx.prisma.expense.update({
        where: { id },
        data: {
          ...data,
          ...(date ? { date: new Date(date) } : {}),
        },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const expense = await ctx.prisma.expense.findUnique({
        where: { id: input.id },
      });

      if (!expense || expense.userId !== ctx.session.user.id) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      await ctx.prisma.expense.delete({ where: { id: input.id } });
      return { success: true };
    }),
});
