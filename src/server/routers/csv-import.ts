import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "@/server/trpc";
import { getParser } from "@/lib/csv-parser";

const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

export const csvImportRouter = router({
  import: protectedProcedure
    .input(
      z.object({
        sourceType: z.string(),
        csvContent: z.string(),
        accountId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const parser = getParser(input.sourceType);
      if (!parser) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `未対応のソースタイプです: ${input.sourceType}`,
        });
      }

      const transactions = parser.parse(input.csvContent);
      if (transactions.length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "取引データが見つかりませんでした",
        });
      }

      // 既存の支出を取得（マッチング用）
      const existingExpenses = await ctx.prisma.expense.findMany({
        where: { userId: ctx.session.user.id },
        select: { id: true, amount: true, date: true },
      });

      let matchedCount = 0;
      let unmatchedCount = 0;

      const csvImportRecord = await ctx.prisma.csvImport.create({
        data: {
          userId: ctx.session.user.id,
          sourceType: input.sourceType,
          status: "processing",
        },
      });

      // 各トランザクションを処理
      for (const tx of transactions) {
        // ±3日以内かつ金額一致でマッチング
        const matched = existingExpenses.find((e) => {
          const dateDiff = Math.abs(e.date.getTime() - tx.date.getTime());
          return dateDiff <= THREE_DAYS_MS && e.amount === tx.amount;
        });

        await ctx.prisma.expense.create({
          data: {
            userId: ctx.session.user.id,
            accountId: input.accountId,
            amount: tx.amount,
            storeName: tx.storeName,
            date: tx.date,
            paymentMethod: tx.paymentMethod,
            status: "confirmed",
            matchedExpenseId: matched?.id,
          },
        });

        if (matched) {
          matchedCount++;
        } else {
          unmatchedCount++;
        }
      }

      await ctx.prisma.csvImport.update({
        where: { id: csvImportRecord.id },
        data: {
          status: "completed",
          matchedCount,
          unmatchedCount,
        },
      });

      return {
        importId: csvImportRecord.id,
        total: transactions.length,
        matchedCount,
        unmatchedCount,
      };
    }),
});
