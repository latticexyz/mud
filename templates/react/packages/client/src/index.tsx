import "./polyfills";
import "@rainbow-me/rainbowkit/styles.css";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import { setup } from "./mud/setup";
import { MUDProvider } from "./MUDContext";
// import mudConfig from "contracts/mud.config";
import { WagmiProvider, createConfig } from "wagmi";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { supportedChains } from "./mud/supportedChains";
import { createClient, http } from "viem";
import { getNetworkConfig } from "./mud/getNetworkConfig";
import { RainbowKitProvider, lightTheme, midnightTheme } from "@rainbow-me/rainbowkit";
import { AccountKitProvider } from "@latticexyz/account-kit";

const queryClient = new QueryClient();

const wagmiConfig = createConfig({
  chains: supportedChains,
  client: ({ chain }) =>
    createClient({
      chain,
      // We intentionally don't use fallback+webSocket here because if a chain's RPC config
      // doesn't include a `webSocket` entry, it doesn't seem to fallback and instead just
      // ~never makes any requests and all queries seem to sit idle.
      transport: http(),
    }),
});

const networkConfig = getNetworkConfig();

const rootElement = document.getElementById("react-root");
if (!rootElement) throw new Error("React root not found");
const root = ReactDOM.createRoot(rootElement);

// TODO: figure out if we actually want this to be async or if we should render something else in the meantime
setup().then(async (result) => {
  root.render(
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={{
            lightMode: lightTheme({ borderRadius: "none" }),
            darkMode: midnightTheme({ borderRadius: "none" }),
          }}
        >
          <AccountKitProvider
            config={{
              chainId: networkConfig.chain.id,
              worldAddress: networkConfig.worldAddress,
              erc4337: false,
            }}
          >
            <MUDProvider value={result}>
              <App />
            </MUDProvider>
          </AccountKitProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>,
  );

  // https://vitejs.dev/guide/env-and-mode.html
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
});
