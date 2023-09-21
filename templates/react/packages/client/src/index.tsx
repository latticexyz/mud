import ReactDOM from "react-dom/client";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiConfig } from "wagmi";
import { share } from "rxjs";
import mudConfig from "contracts/mud.config";
import IWorldAbi from "contracts/out/IWorld.sol/IWorld.abi.json";
import { App } from "./App";
import { MUDProvider, useMUD } from "./MUDContext";
import { useSetup } from "./hooks/useSetup";

const rootElement = document.getElementById("react-root");
if (!rootElement) throw new Error("React root not found");
const root = ReactDOM.createRoot(rootElement);

const AppWithWalletContext = () => {
  const setup = useSetup();

  // https://vitejs.dev/guide/env-and-mode.html
  if (import.meta.env.DEV && setup) {
    import("@latticexyz/dev-tools").then(({ mount: mountDevTools }) =>
      mountDevTools({
        config: mudConfig,
        publicClient: setup.network.publicClient,
        walletClient: setup.network.walletClient,
        latestBlock$: setup.network.latestBlock$,
        storedBlockLogs$: setup.network.storedBlockLogs$,
        worldAddress: setup.network.worldAddress,
        worldAbi: IWorldAbi,
        write$: setup.network.write$.asObservable().pipe(share()),
        recsWorld: setup.network.world,
      })
    );
  }

  if (!setup) return <>Loading...</>;
  return (
    <WagmiConfig config={setup.network.wagmiConfig}>
      <RainbowKitProvider chains={[setup.network.chain]}>
        <App setup={setup} />
      </RainbowKitProvider>
    </WagmiConfig>
  );
};

root.render(<AppWithWalletContext />);
