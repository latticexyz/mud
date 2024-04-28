import "@rainbow-me/rainbowkit/styles.css";
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { WagmiProvider, createConfig } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, lightTheme, midnightTheme } from "@rainbow-me/rainbowkit";
import { garnet, mudFoundry, redstone } from "@latticexyz/common/chains";
import { AccountModal } from "../src/AccountModal";
import { AccountKitConfigProvider } from "../src/AccountKitConfigProvider";
import { App } from "./App";
import { Hex, createClient, http } from "viem";
import { chains } from "../src/exports/chains";

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

const testWorlds = {
  [mudFoundry.id]: "0x8d8b6b8414e1e3dcfd4168561b9be6bd3bf6ec4b",
  [garnet.id]: "0xb757a4838d6ed3328f43af22bbd153e221ef0997",
  [redstone.id]: "0xc6b640ea79444c1bb0c6924771cc7432fb0bddd6",
} as Partial<Record<string, Hex>>;

const searchParams = new URLSearchParams(window.location.search);
const chainId = parseInt(searchParams.get("chainId") ?? "") || mudFoundry.id;
const worldAddress = testWorlds[chainId];
if (!worldAddress) {
  throw new Error(`Account Kit playground is not configured with a test world address for chain ID ${chainId}`);
}

const accountKitConfig = {
  chainId,
  worldAddress,
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
