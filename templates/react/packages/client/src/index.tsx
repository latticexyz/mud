import ReactDOM from "react-dom/client";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ExternalWallet } from "./ExternalWallet";
import { DevTools } from "./DevTools";
import { App } from "./App";
import { setup } from "./mud/setup";
import { MUDProvider } from "./MUDContext";

const rootElement = document.getElementById("react-root");
if (!rootElement) throw new Error("React root not found");
const root = ReactDOM.createRoot(rootElement);

const queryClient = new QueryClient();

// TODO: figure out if we actually want this to be async or if we should render something else in the meantime
setup().then(({ network, wagmiConfig }) => {
  root.render(
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <ExternalWallet />
        <MUDProvider value={network}>
          <App />
          {import.meta.env.DEV && <DevTools />}
        </MUDProvider>
      </QueryClientProvider>
    </WagmiProvider>,
  );
});
