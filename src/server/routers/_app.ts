import { router } from "@/server/trpc";
import { authRouter } from "./auth";
import { familyRouter } from "./family";
import { accountRouter } from "./account";
import { expenseRouter } from "./expense";
import { ocrRouter } from "./ocr";
import { settlementRouter } from "./settlement";
import { dashboardRouter } from "./dashboard";
import { csvImportRouter } from "./csv-import";
import { userRouter } from "./user";

export const appRouter = router({
  auth: authRouter,
  family: familyRouter,
  account: accountRouter,
  expense: expenseRouter,
  ocr: ocrRouter,
  settlement: settlementRouter,
  dashboard: dashboardRouter,
  csvImport: csvImportRouter,
  user: userRouter,
});

export type AppRouter = typeof appRouter;
