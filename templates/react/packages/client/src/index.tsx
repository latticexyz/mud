import ReactDOM from "react-dom/client";
import { setupNetwork } from "./mud/setupNetwork";
import { NetworkProvider } from "./mud/NetworkContext";
import { StoreSync } from "./mud/StoreSync";
import { WalletAdapter } from "./mud/wallet/WalletAdapter";
import { DevTools } from "./mud/DevTools";
import { App } from "./App";

const rootElement = document.getElementById("react-root");
if (!rootElement) throw new Error("React root not found");
const root = ReactDOM.createRoot(rootElement);

// TODO: figure out if we actually want this to be async or if we should render something else in the meantime
setupNetwork().then((network) => {
  root.render(
    <NetworkProvider network={network}>
      <StoreSync>
        <WalletAdapter>
          <App />
          {import.meta.env.DEV && <DevTools />}
        </WalletAdapter>
      </StoreSync>
    </NetworkProvider>,
  );
});
