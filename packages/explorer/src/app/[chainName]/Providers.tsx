"use client";

import { useParams } from "next/navigation";
import { WagmiProvider, createConfig, http } from "wagmi";
import { injected, metaMask, safe } from "wagmi/connectors";
import { ReactNode } from "react";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { namedChains } from "../../common";
import { getDefaultAnvilConnectors } from "../../connectors/anvil";

const queryClient = new QueryClient();

export function Providers({ children }: { children: ReactNode }) {
  const { chainName } = useParams();
  const chain = namedChains[chainName as string];
  if (!chain) {
    throw new Error(`Chain ${chainName} not supported`);
  }

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
