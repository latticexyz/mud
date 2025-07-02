import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  internal_AccountModal as AccountModal,
  internal_EntryKitConfigProvider as EntryKitConfigProvider,
  defineConfig,
} from "@latticexyz/entrykit/internal";
import { wagmiConfig } from "./wagmiConfig";
import { chainId, worldAddress } from "./common";
import { App } from "./App";

const queryClient = new QueryClient();

const root = ReactDOM.createRoot(document.querySelector("#react-root")!);
root.render(
  <StrictMode>
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <EntryKitConfigProvider config={defineConfig({ chainId, worldAddress })}>
          <App />
          <AccountModal />
        </EntryKitConfigProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </StrictMode>,
);
