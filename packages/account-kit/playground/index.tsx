import "./polyfills";
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { WagmiProvider } from "wagmi";
import { Hex } from "viem";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { garnet, mudFoundry, redstone } from "@latticexyz/common/chains";
import { App } from "./App";
import { AccountKit } from "../src/exports";
import { AccountKitProvider } from "../src/react/AccountKitProvider";

console.log("AccountKit.getVersion", AccountKit.getVersion());

const testWorlds = {
  [mudFoundry.id]: "0x8d8b6b8414e1e3dcfd4168561b9be6bd3bf6ec4b",
  [garnet.id]: "0x352bd50fc7cbb8a1b3e5f84cf6f4e7d84792acd1",
  [redstone.id]: "0x51778368cd250e4e3800a8fb20c32474c5f1c8cd",
} as Partial<Record<string, Hex>>;

const searchParams = new URLSearchParams(window.location.search);
const chainId = parseInt(searchParams.get("chainId") ?? "") || mudFoundry.id;
const worldAddress = testWorlds[chainId];
if (!worldAddress) {
  throw new Error(`Account Kit playground is not configured with a test world address for chain ID ${chainId}`);
}

const accountKit = AccountKit.init({
  chainId,
  worldAddress,
  erc4337: false,
  appInfo: {
    termsOfUse: "#terms",
    privacyPolicy: "#privacy",
  },
  wagmi: {
    chains: [mudFoundry, ...AccountKit.getDefaultChains()],
  },
});

const queryClient = new QueryClient();

const root = ReactDOM.createRoot(document.querySelector("#react-root")!);
root.render(
  <StrictMode>
    <AccountKitProvider instance={accountKit}>
      <WagmiProvider config={accountKit.getWagmiConfig()}>
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </WagmiProvider>
    </AccountKitProvider>
  </StrictMode>,
);
