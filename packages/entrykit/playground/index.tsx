import "./polyfills";
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { WagmiProvider, createConfig } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { connectorsForWallets, getDefaultWallets, WalletList } from "@rainbow-me/rainbowkit";
import { garnet, mudFoundry, redstone } from "@latticexyz/common/chains";
import { passkeyWallet } from "../src/passkey/passkeyWallet";
import { AccountModal } from "../src/AccountModal";
import { EntryKitConfigProvider } from "../src/EntryKitConfigProvider";
import { App } from "./App";
import { Chain, Hex, http } from "viem";

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

const queryClient = new QueryClient();

const { wallets: defaultWallets } = getDefaultWallets();
const wallets: WalletList = [
  {
    groupName: "Recommended",
    wallets: [passkeyWallet({ chainId })],
  },
  ...defaultWallets,
];

const connectors = connectorsForWallets(wallets, {
  appName: "EAT THE FLY",
  projectId: "14ce88fdbc0f9c294e26ec9b4d848e44",
});

const chains = [redstone, garnet, mudFoundry] as [Chain, ...Chain[]];
const wagmiConfig = createConfig({
  connectors,
  chains,
  transports: Object.fromEntries(
    chains.map((chain) => [chain.id, chain.id === 31337 ? http("http://127.0.0.1:3478") : http()]),
  ),
});

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
        <EntryKitConfigProvider config={entryKitConfig}>
          <App />
          <AccountModal />
        </EntryKitConfigProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </StrictMode>,
);
