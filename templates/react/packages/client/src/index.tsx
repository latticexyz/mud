import ReactDOM from "react-dom/client";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiConfig } from "wagmi";
import { share } from "rxjs";
import { App } from "./App";
import { setup } from "./mud/setup";
import { MUDProvider } from "./MUDContext";
import mudConfig from "contracts/mud.config";
import IWorldAbi from "contracts/out/IWorld.sol/IWorld.abi.json";

const rootElement = document.getElementById("react-root");
if (!rootElement) throw new Error("React root not found");
const root = ReactDOM.createRoot(rootElement);

// TODO: figure out if we actually want this to be async or if we should render something else in the meantime
setup().then(async (result) => {
  const {
    network: { wagmiConfig, chain },
  } = result;
  root.render(
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={[chain]}>
        <MUDProvider value={result}>
          <App />
        </MUDProvider>
      </RainbowKitProvider>
    </WagmiConfig>
  );

  // https://vitejs.dev/guide/env-and-mode.html
  if (import.meta.env.DEV) {
    const { mount: mountDevTools } = await import("@latticexyz/dev-tools");
    mountDevTools({
      config: mudConfig,
      publicClient: result.network.publicClient,
      walletClient: result.network.walletClient,
      latestBlock$: result.network.latestBlock$,
      storedBlockLogs$: result.network.storedBlockLogs$,
      worldAddress: result.network.worldAddress,
      worldAbi: IWorldAbi,
      write$: result.network.write$.asObservable().pipe(share()),
      recsWorld: result.network.world,
    });
  }
});
