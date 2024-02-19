import ReactDOM from "react-dom/client";
import { WagmiConfig } from "wagmi";
import { ExternalWallet } from "./ExternalWallet";
import { MUDReadProvider } from "./mud/read";
import { MUDWriteProvider } from "./mud/write";
import { App } from "./App";
import { setup } from "./mud/setup";

const rootElement = document.getElementById("react-root");
if (!rootElement) throw new Error("React root not found");
const root = ReactDOM.createRoot(rootElement);

// TODO: figure out if we actually want this to be async or if we should render something else in the meantime
setup().then(async ({ mud, wagmiConfig }) => {
  root.render(
    <WagmiConfig config={wagmiConfig}>
      <ExternalWallet />
      <MUDReadProvider value={mud}>
        <MUDWriteProvider>
          <App />
        </MUDWriteProvider>
      </MUDReadProvider>
    </WagmiConfig>
  );
});
