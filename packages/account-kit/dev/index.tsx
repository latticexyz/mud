import "@rainbow-me/rainbowkit/styles.css";
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { WagmiProvider, createConfig, http } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, lightTheme, midnightTheme } from "@rainbow-me/rainbowkit";
import { mudFoundry } from "@latticexyz/common/chains";
import { AccountModal } from "../src/AccountModal";
import { AccountKitConfigProvider } from "../src/AccountKitConfigProvider";
import { App } from "./App";
import { createClient, fallback, webSocket } from "viem";
import { chains } from "../src/exports/chains";

const queryClient = new QueryClient();

const wagmiConfig = createConfig({
  chains: [mudFoundry, ...chains],
  client: ({ chain }) =>
    createClient({
      chain,
      transport: fallback([webSocket(), http()]),
      pollingInterval: 1_000,
    }),
});

const accountKitConfig = {
  chainId: mudFoundry.id,
  worldAddress: "0xd6c8022f1af8e9d7c3825557a1374ee518c65a4e",
  erc4337: false,
} as const;

const root = ReactDOM.createRoot(document.querySelector("#react-root")!);
root.render(
  <StrictMode>
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={{
            lightMode: lightTheme({ borderRadius: "none" }),
            darkMode: midnightTheme({ borderRadius: "none" }),
          }}
        >
          <AccountKitConfigProvider config={accountKitConfig}>
            <App />
            <AccountModal />
          </AccountKitConfigProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </StrictMode>,
);
