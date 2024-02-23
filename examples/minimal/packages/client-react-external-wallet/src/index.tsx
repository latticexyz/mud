import ReactDOM from "react-dom/client";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ExternalWallet } from "./ExternalWallet";
import { MUDReadProvider } from "./mud/read";
import { MUDWriteProvider } from "./mud/write";
import { App } from "./App";
import { DevTools } from "./DevTools";
import { setup } from "./mud/setup";

const rootElement = document.getElementById("react-root");
if (!rootElement) throw new Error("React root not found");
const root = ReactDOM.createRoot(rootElement);

const queryClient = new QueryClient();

// TODO: figure out if we actually want this to be async or if we should render something else in the meantime
setup().then(({ mud, wagmiConfig }) => {
  root.render(
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <ExternalWallet />
        <MUDReadProvider value={mud}>
          <MUDWriteProvider>
            <App />
            {import.meta.env.DEV && <DevTools />}
          </MUDWriteProvider>
        </MUDReadProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
});
