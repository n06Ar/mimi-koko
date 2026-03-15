import "server-only";
import { cache } from "react";
import { createCallerFactory } from "@/server/trpc";
import { appRouter } from "@/server/routers/_app";
import { createContext } from "@/server/context";

const createCaller = createCallerFactory(appRouter);

export const createServerCaller = cache(async () => createCaller(await createContext()));
