import { z } from "zod";
import { protectedProcedure, router } from "@/server/trpc";
import { processReceiptOCR } from "@/lib/ollama";

export const ocrRouter = router({
  processReceipt: protectedProcedure
    .input(z.object({ imageBase64: z.string() }))
    .mutation(async ({ input }) => {
      return processReceiptOCR(input.imageBase64);
    }),
});
