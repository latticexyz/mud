"use client";

import { WagmiProvider, createConfig, http } from "wagmi";
import { injected, metaMask, safe } from "wagmi/connectors";
import { ReactNode } from "react";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { chain } from "../../common";
import { defaultAnvilConnectors } from "../../connectors/anvil";

const queryClient = new QueryClient();

export const wagmiConfig = createConfig({
  chains: [chain],
  connectors: [
    injected(),
    metaMask({
      dappMetadata: {
        name: "World Explorer",
      },
    }),
    safe(),
    ...defaultAnvilConnectors,
  ],
  transports: {
    [chain.id]: http(),
  },
  ssr: true,
});

export function Providers({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme()}>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
