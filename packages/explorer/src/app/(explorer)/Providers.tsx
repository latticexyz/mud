"use client";

import { WagmiProvider } from "wagmi";
import { injected, metaMask, safe } from "wagmi/connectors";
import { ReactNode } from "react";
import { RainbowKitProvider, darkTheme, getDefaultConfig } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createConfig, http } from "@wagmi/core";
import { localhost, redstone } from "@wagmi/core/chains";
import { AppStoreProvider } from "../../store";

const queryClient = new QueryClient();

const config = getDefaultConfig({
  appName: "World Explorer",
  projectId: "368e129bd75ddd92d41f5bf7ac4cf1e6", // TODO: process.env.NEXT_PUBLIC_PROJECT_ID,
  chains: [redstone, localhost],
  ssr: true,
});

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
        <RainbowKitProvider config={config} theme={darkTheme()}>
          <AppStoreProvider>{children}</AppStoreProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
