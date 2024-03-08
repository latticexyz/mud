import ReactDOM from "react-dom/client";
import { setup } from "./mud/setup";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NetworkProvider } from "./mud/NetworkContext";
import { StoreSync } from "./mud/StoreSync";
import { WalletAdapter } from "./mud/wallet/WalletAdapter";
import { DevTools } from "./mud/DevTools";
import { App } from "./App";

const rootElement = document.getElementById("react-root");
if (!rootElement) throw new Error("React root not found");
const root = ReactDOM.createRoot(rootElement);

const queryClient = new QueryClient();

// TODO: figure out if we actually want this to be async or if we should render something else in the meantime
setup().then(({ network, wagmiConfig }) => {
  root.render(
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <NetworkProvider network={network}>
          <StoreSync>
            <WalletAdapter>
              <App />
              {import.meta.env.DEV && <DevTools />}
            </WalletAdapter>
          </StoreSync>
        </NetworkProvider>
      </QueryClientProvider>
    </WagmiProvider>,
  );
});
