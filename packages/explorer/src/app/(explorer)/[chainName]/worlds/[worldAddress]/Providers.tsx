"use client";

// import { burner } from "burner-connector";
import { rainbowkitBurnerWallet } from "burner-connector";
import { WagmiProvider, createConfig, http } from "wagmi";
// import { injected, metaMask, safe } from "wagmi/connectors";
import { ReactNode, useMemo } from "react";
import { RainbowKitProvider, connectorsForWallets, darkTheme } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
// import { getDefaultAnvilConnectors } from "../../../../../connectors/anvil";
import { metaMaskWallet } from "@rainbow-me/rainbowkit/wallets";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useChain } from "../../../../../hooks/useChain";

const queryClient = new QueryClient();

const wallets = [metaMaskWallet, rainbowkitBurnerWallet];
const wagmiConnectors = connectorsForWallets(
  [
    {
      groupName: "Supported Wallets",
      wallets,
    },
  ],
  {
    appName: "World Explorer",
    projectId: "YOUR_WALLET_CONNECT_PROJECT_ID",
  },
);

export function Providers({ children }: { children: ReactNode }) {
  const chain = useChain();
  const wagmiConfig = useMemo(() => {
    return createConfig({
      chains: [chain],
      connectors: wagmiConnectors,
      // connectors: [
      //   injected(),
      //   metaMask({
      //     dappMetadata: {
      //       name: "World Explorer",
      //     },
      //   }),
      //   safe(),
      //   // ...getDefaultAnvilConnectors(chain.id),
      //   burner(),
      // ],
      transports: {
        [chain.id]: http(),
      },
      ssr: true,
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
