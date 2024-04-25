import "@rainbow-me/rainbowkit/styles.css";
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { WagmiProvider, createConfig } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, lightTheme, midnightTheme } from "@rainbow-me/rainbowkit";
import { garnet, mudFoundry } from "@latticexyz/common/chains";
import { AccountModal } from "../src/AccountModal";
import { AccountKitConfigProvider } from "../src/AccountKitConfigProvider";
import { App } from "./App";
import { createClient, http } from "viem";
import { chains } from "../src/exports/chains";
import { baseSepolia } from "viem/chains";

const queryClient = new QueryClient();

const wagmiConfig = createConfig({
  chains: [mudFoundry, ...chains],
  client: ({ chain }) =>
    createClient({
      chain,
      // We intentionally don't use fallback+webSocket here because if a chain's RPC config
      // doesn't include a `webSocket` entry, it doesn't seem to fallback and instead just
      // ~never makes any requests and all queries seem to sit idle.
      transport: http(),
    }),
});

const accountKitConfig = {
  // chainId: mudFoundry.id,
  // worldAddress: "0xd6c8022f1af8e9d7c3825557a1374ee518c65a4e",
  chainId: baseSepolia.id,
  worldAddress: "0x1937849232f62017c4ec688f48cf5c7f3eca3dfc",
  // chainId: redstone.id,
  // worldAddress: "0xc6b640ea79444c1bb0c6924771cc7432fb0bddd6",
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
