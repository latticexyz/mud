import ReactDOM from "react-dom/client";
import { App } from "./App";
import { setup } from "./mud/setup";
import { MUDProvider } from "./MUDContext";
// import mudConfig from "contracts/mud.config";

import "@rainbow-me/rainbowkit/styles.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, createConfig, http } from "wagmi";
import { hardhat } from "wagmi/chains";
// import { arbitrum, base, mainnet, optimism, polygon, zora } from "wagmi/chains";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { transportObserver } from "@latticexyz/common";
import { fallback, webSocket } from "viem";

const config = createConfig({
  chains: [hardhat],
  pollingInterval: 1_000,
  transports: {
    [hardhat.id]: transportObserver(fallback([webSocket(), http()])),
  },
});

// const config = getDefaultConfig({
//   appName: "RainbowKit App",
//   projectId: "YOUR_PROJECT_ID",
//   chains: [mainnet, polygon, optimism, arbitrum, base, zora],
// });

const client = new QueryClient();

const rootElement = document.getElementById("react-root");
if (!rootElement) throw new Error("React root not found");
const root = ReactDOM.createRoot(rootElement);

// TODO: figure out if we actually want this to be async or if we should render something else in the meantime
// setup().then(async (result) => {
root.render(
  // <MUDProvider value={result}>

  <WagmiProvider config={config}>
    <QueryClientProvider client={client}>
      <RainbowKitProvider>
        <MUDProvider value={await setup()}>
          {/* <Component {...pageProps} /> */}
          <App />
        </MUDProvider>
      </RainbowKitProvider>
    </QueryClientProvider>
  </WagmiProvider>,
);

// https://vitejs.dev/guide/env-and-mode.html
// TODO: change this

// if (import.meta.env.DEV) {
//   const { mount: mountDevTools } = await import("@latticexyz/dev-tools");
//   mountDevTools({
//     config: mudConfig,
//     publicClient: result.network.publicClient,
//     walletClient: result.network.walletClient,
//     latestBlock$: result.network.latestBlock$,
//     storedBlockLogs$: result.network.storedBlockLogs$,
//     worldAddress: result.network.worldContract.address,
//     worldAbi: result.network.worldContract.abi,
//     write$: result.network.write$,
//     useStore: result.network.useStore,
//   });
// }
// });
