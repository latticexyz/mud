import "./polyfills";
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { WagmiProvider, createConfig } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { connectorsForWallets, getDefaultWallets, WalletList } from "@rainbow-me/rainbowkit";
import { garnet, redstone } from "@latticexyz/common/chains";
import { anvil } from "viem/chains";
import { passkeyWallet } from "../src/passkey/passkeyWallet";
import { SignInModal } from "../src/SignInModal";
import { EntryKitConfigProvider } from "../src/EntryKitConfigProvider";
import { App } from "./App";
import { Chain, Hex, http } from "viem";

const testWorlds = {
  [anvil.id]: "0xdc1069d47206299a0b864a6ffcafbf4bc70c207c",
  [garnet.id]: "0x352bd50fc7cbb8a1b3e5f84cf6f4e7d84792acd1",
  [redstone.id]: "0x51778368cd250e4e3800a8fb20c32474c5f1c8cd",
} as Partial<Record<string, Hex>>;

const searchParams = new URLSearchParams(window.location.search);
const chainId = parseInt(searchParams.get("chainId") ?? "") || anvil.id;
const worldAddress = testWorlds[chainId];
if (!worldAddress) {
  throw new Error(`EntryKit playground is not configured with a test world address for chain ID ${chainId}`);
}

const queryClient = new QueryClient();

const { wallets: defaultWallets } = getDefaultWallets();
const wallets: WalletList = [
  {
    groupName: "Recommended",
    wallets: [passkeyWallet({ chainId, bundlerTransport: http("http://127.0.0.1:4337") })],
  },
  ...defaultWallets,
];

const connectors = connectorsForWallets(wallets, {
  appName: "EAT THE FLY",
  projectId: "14ce88fdbc0f9c294e26ec9b4d848e44",
});

const chains = [anvil, redstone, garnet] as [Chain, ...Chain[]];
const transports = Object.fromEntries(
  chains.map((chain) => [chain.id, chain.id === 31337 ? http("http://127.0.0.1:3478") : http()]),
);

const wagmiConfig = createConfig({ connectors, chains, transports });

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
          <SignInModal />
        </EntryKitConfigProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </StrictMode>,
);
