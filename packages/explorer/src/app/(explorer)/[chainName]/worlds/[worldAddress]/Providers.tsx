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
  const configuredChain = useChain();
  const wagmiConfig = useMemo(() => {
    return createConfig({
      chains: [configuredChain],
      connectors: [
        injected(),
        metaMask({
          dappMetadata: {
            name: "World Explorer",
          },
        }),
        safe(),
        ...getDefaultAnvilConnectors(configuredChain.id),
      ],
      transports: {
        [configuredChain.id]: fallback([
          ...(configuredChain.rpcUrls.default.webSocket
            ? [webSocket(configuredChain.rpcUrls.default.webSocket[0])]
            : []),
          http(configuredChain.rpcUrls.default.http[0]),
        ]),
      },
      ssr: true,
      pollingInterval: {
        [configuredChain.id]: configuredChain.id === 31337 ? 100 : 500,
      },
    });
  }, [configuredChain]);

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme()}>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
