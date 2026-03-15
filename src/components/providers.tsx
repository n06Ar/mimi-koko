"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { httpBatchStreamLink } from "@trpc/client";
import { SessionProvider } from "next-auth/react";
import { useState } from "react";
import { trpc } from "@/trpc/client";
import { makeQueryClient } from "@/trpc/query-client";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => makeQueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchStreamLink({
          url: "/api/trpc",
        }),
      ],
    })
  );

  return (
    <SessionProvider>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </trpc.Provider>
    </SessionProvider>
  );
}
