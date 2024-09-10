"use client";

import { WagmiProvider, createConfig, http } from "wagmi";
import { injected, metaMask, safe } from "wagmi/connectors";
import { ReactNode } from "react";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { anvil as anvilChain } from "@wagmi/core/chains";
import { anvil } from "../../connectors/anvil";
import { AppStoreProvider } from "../../store";

const queryClient = new QueryClient();

export const wagmiConfig = createConfig({
  chains: [anvilChain],
  connectors: [
    injected(),
    metaMask({
      dappMetadata: {
        name: "World Explorer",
      },
    }),
    safe(),
    anvil(),
  ],
  transports: {
    [anvilChain.id]: http(),
  },
  ssr: true,
});

export function Providers({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme()}>
          <AppStoreProvider>{children}</AppStoreProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
