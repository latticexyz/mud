import ReactDOM from "react-dom/client";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiConfig } from "wagmi";
import { share } from "rxjs";
import mudConfig from "contracts/mud.config";
import IWorldAbi from "contracts/out/IWorld.sol/IWorld.abi.json";
import { App } from "./App";
import { MUDProvider, useMUD } from "./MUDContext";

const rootElement = document.getElementById("react-root");
if (!rootElement) throw new Error("React root not found");
const root = ReactDOM.createRoot(rootElement);

const AppWithWalletContext = () => {
  const { network } = useMUD();
  const { wagmiConfig, chain } = network;

  // https://vitejs.dev/guide/env-and-mode.html
  if (import.meta.env.DEV) {
    import("@latticexyz/dev-tools").then(({ mount: mountDevTools }) =>
      mountDevTools({
        config: mudConfig,
        publicClient: network.publicClient,
        walletClient: network.walletClient,
        latestBlock$: network.latestBlock$,
        storedBlockLogs$: network.storedBlockLogs$,
        worldAddress: network.worldAddress,
        worldAbi: IWorldAbi,
        write$: network.write$.asObservable().pipe(share()),
        recsWorld: network.world,
      })
    );
  }

  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={[chain]}>
        <App />
      </RainbowKitProvider>
    </WagmiConfig>
  );
};

root.render(
  <MUDProvider>
    <AppWithWalletContext />
  </MUDProvider>
);
