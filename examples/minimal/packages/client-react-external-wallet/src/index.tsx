import ReactDOM from "react-dom/client";
import { WagmiConfig } from "wagmi";
import { App } from "./App";
import { getWagmiConfig } from "./mud/getWagmiConfig";
import { getNetworkConfig, NetworkConfigProvider } from "./mud/networkConfig";

const rootElement = document.getElementById("react-root");
if (!rootElement) throw new Error("React root not found");
const root = ReactDOM.createRoot(rootElement);

const networkConfig = getNetworkConfig();
const wagmiConfig = getWagmiConfig(networkConfig.chain);

root.render(
  <WagmiConfig config={wagmiConfig}>
    <NetworkConfigProvider config={networkConfig}>
      <App />
    </NetworkConfigProvider>
  </WagmiConfig>
);
