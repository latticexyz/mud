"use client";

import { ReactNode } from "react";
import { WagmiProvider } from "wagmi";
import { http, createConfig } from "@wagmi/core";
import { localhost } from "@wagmi/core/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export const wagmiConfig = createConfig({
  chains: [localhost],
  transports: {
    [localhost.id]: http(),
  },
});

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={wagmiConfig}>{children}</WagmiProvider>
    </QueryClientProvider>
  );
}
