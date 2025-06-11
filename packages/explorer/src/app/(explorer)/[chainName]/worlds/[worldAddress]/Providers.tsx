"use client";

import { WagmiProvider, createConfig, fallback, http, webSocket } from "wagmi";
import { ReactNode, useMemo } from "react";
import { RainbowKitProvider, connectorsForWallets, darkTheme } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { injectedWallet, metaMaskWallet, safeWallet } from "@rainbow-me/rainbowkit/wallets";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { getDefaultAnvilConnectors } from "../../../../../connectors/anvil";
import { useChain } from "../../../hooks/useChain";

const queryClient = new QueryClient();

export function Providers({ children }: { children: ReactNode }) {
  const chain = useChain();
  const wagmiConfig = useMemo(() => {
    const anvilConnectors = getDefaultAnvilConnectors(chain.id);
    const walletConnectors = connectorsForWallets(
      [
        {
          groupName: "Recommended",
          wallets: [injectedWallet, metaMaskWallet, safeWallet],
        },
      ],
      { appName: "Worlds Explorer", projectId: process.env.NEXT_PUBLIC_PROJECT_ID! },
    );

    return createConfig({
      chains: [chain],
      connectors: [...walletConnectors, ...anvilConnectors],
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
