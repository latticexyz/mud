import ReactDOM from "react-dom/client";
import { App } from "./App";
import { setup } from "./mud/setup";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MUD } from "./mud/MUD";

const rootElement = document.getElementById("react-root");
if (!rootElement) throw new Error("React root not found");
const root = ReactDOM.createRoot(rootElement);

// Wagmi depends on TanStack Query.
const queryClient = new QueryClient();

// TODO: figure out if we actually want this to be async or if we should render something else in the meantime
setup().then(({ network, wagmiConfig }) => {
  root.render(
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <MUD network={network}>
          <App />
        </MUD>
      </QueryClientProvider>
    </WagmiProvider>,
  );
});
