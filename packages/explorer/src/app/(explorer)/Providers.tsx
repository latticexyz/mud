"use client";

import { Chain, anvil, redstone } from "viem/chains";
import { WagmiProvider, createConfig, http } from "wagmi";
import { injected, metaMask, safe } from "wagmi/connectors";
import { ReactNode } from "react";
import { garnet } from "@latticexyz/common/chains";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { defaultAnvilConnectors } from "../../connectors/anvil";

const queryClient = new QueryClient();

const chains = {
  [anvil.id]: anvil,
  [redstone.id]: redstone,
  [garnet.id]: garnet,
};
export const chainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID || anvil.id);
const chain = chains[chainId as keyof typeof chains] as Chain;

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
