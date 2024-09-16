"use client";

import { WagmiProvider, createConfig, http } from "wagmi";
import { injected, metaMask, safe } from "wagmi/connectors";
import { ReactNode } from "react";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { getDefaultAnvilConnectors } from "../../connectors/anvil";
import { useChain } from "../../hooks/useChain";

const queryClient = new QueryClient();

export function Providers({ children }: { children: ReactNode }) {
  const chain = useChain();
  const wagmiConfig = createConfig({
    chains: [chain],
    connectors: [
      injected(),
      metaMask({
        dappMetadata: {
          name: "World Explorer",
        },
      }),
      safe(),
      ...getDefaultAnvilConnectors(chain.id),
    ],
    transports: {
      [chain.id]: http(),
    },
    ssr: true,
  });

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme()}>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
