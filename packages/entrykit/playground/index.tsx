import "./polyfills";
import "@rainbow-me/rainbowkit/styles.css";
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { WagmiProvider, createConfig } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, lightTheme, midnightTheme } from "@rainbow-me/rainbowkit";
import { garnet, mudFoundry, redstone } from "@latticexyz/common/chains";
import { AccountModal } from "../src/AccountModal";
import { EntryKitConfigProvider } from "../src/EntryKitConfigProvider";
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
      transport: chain.id === 31337 ? http("http://127.0.0.1:3478") : http(),
    }),
});

const testWorlds = {
  [mudFoundry.id]: "0x8d8b6b8414e1e3dcfd4168561b9be6bd3bf6ec4b",
  [garnet.id]: "0x352bd50fc7cbb8a1b3e5f84cf6f4e7d84792acd1",
  [redstone.id]: "0x51778368cd250e4e3800a8fb20c32474c5f1c8cd",
} as Partial<Record<string, Hex>>;

const searchParams = new URLSearchParams(window.location.search);
const chainId = parseInt(searchParams.get("chainId") ?? "") || mudFoundry.id;
const worldAddress = testWorlds[chainId];
if (!worldAddress) {
  throw new Error(`EntryKit playground is not configured with a test world address for chain ID ${chainId}`);
}

const entryKitConfig = {
  chainId,
  worldAddress,
  erc4337: false,
  appInfo: {
    termsOfUse: "#terms",
    privacyPolicy: "#privacy",
  },
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
          <EntryKitConfigProvider config={entryKitConfig}>
            <App />
            <AccountModal />
          </EntryKitConfigProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </StrictMode>,
);
