import { useEffect } from "react";
import { useNetworkLayer } from "./hooks/useNetworkLayer";
import { useStore } from "../store";
import { PhaserLayer } from "./PhaserLayer";
import { UIRoot } from "./UIRoot";
import mudConfig from "contracts/mud.config";

export const App = () => {
  const networkLayer = useNetworkLayer();

  useEffect(() => {
    if (!networkLayer) return;

    useStore.setState({ networkLayer });

    // https://vitejs.dev/guide/env-and-mode.html
    if (import.meta.env.DEV) {
      import("@latticexyz/dev-tools").then(({ mount: mountDevTools }) =>
        mountDevTools({
          config: mudConfig,
          publicClient: networkLayer.network.publicClient,
          walletClient: networkLayer.network.walletClient,
          latestBlock$: networkLayer.network.latestBlock$,
          blockStorageOperations$: networkLayer.network.blockStorageOperations$,
          worldAddress: networkLayer.network.worldContract.address,
          worldAbi: networkLayer.network.worldContract.abi,
          worldWrite:networkLayer.network.worldContract.write,
          write$: networkLayer.network.write$,
          recsWorld: networkLayer.world,
        })
      );
    }
  }, [networkLayer]);

  return (
    <div>
      <PhaserLayer networkLayer={networkLayer} />
      <UIRoot />
    </div>
  );
};
