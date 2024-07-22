"use client";

import { ReactNode } from "react";
import { WagmiProvider } from "wagmi";
import { http, createConfig } from "@wagmi/core";
import { localhost } from "@wagmi/core/chains";
import { injected, metaMask, safe } from "wagmi/connectors";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export const wagmiConfig = createConfig({
  chains: [localhost],
  connectors: [
    injected(),
    metaMask({
      dappMetadata: {
        name: "World Explorer",
      },
    }),
    safe(),
  ],
  transports: {
    [localhost.id]: http(),
  },
});

export function Providers({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
