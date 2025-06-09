"use client";

import { WagmiProvider, createConfig, fallback, http, webSocket } from "wagmi";
import { injected, metaMask, safe } from "wagmi/connectors";
import { ReactNode, useMemo } from "react";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { getDefaultAnvilConnectors } from "../../../../../connectors/anvil";
import { useChain } from "../../../hooks/useChain";

const queryClient = new QueryClient();

export function Providers({ children }: { children: ReactNode }) {
  const chain = useChain();
  const wagmiConfig = useMemo(() => {
    return createConfig({
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
        [chain.id]: chain.rpcUrls.default.webSocket
          ? fallback([webSocket(chain.rpcUrls.default.webSocket[0]), http(chain.rpcUrls.default.http[0])])
          : http(chain.rpcUrls.default.http[0]),
      },
      ssr: true,
      pollingInterval: {
        [chain.id]: chain.id === 31337 ? 100 : 500,
      },
    });
  }, [chain]);

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme()}>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
