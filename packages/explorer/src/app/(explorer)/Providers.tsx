"use client";

import { WagmiProvider } from "wagmi";
import { injected, metaMask, safe } from "wagmi/connectors";
import { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createConfig, http } from "@wagmi/core";
import { localhost, redstone } from "@wagmi/core/chains";
import { AppStoreProvider } from "../../store";

const queryClient = new QueryClient();

export const wagmiConfig = createConfig({
  chains: [localhost, redstone],
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
    [redstone.id]: http(),
  },
});

export function Providers({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <AppStoreProvider>{children}</AppStoreProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
