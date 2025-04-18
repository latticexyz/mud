"use client";

import { ReactNode } from "react";
import "@rainbow-me/rainbowkit/styles.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ServerEnvProvider } from "./providers/ServerEnvProvider";

const queryClient = new QueryClient();

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ServerEnvProvider>{children}</ServerEnvProvider>
    </QueryClientProvider>
  );
}
