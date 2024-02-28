import { useEffect } from "react";
import { useMUD } from "./mud/NetworkContext";
import IWorldAbi from "contracts/out/IWorld.sol/IWorld.abi.json";
import mudConfig from "contracts/mud.config";

// Displays dev-tools for the burner wallet
export const DevTools = () => {
  const { network } = useMUD();

  useEffect(() => {
    // TODO: Handle unmount properly by updating the dev-tools implementation.
    let unmount: (() => void) | null = null;

    import("@latticexyz/dev-tools")
      .then(({ mount }) =>
        mount({
          config: mudConfig,
          publicClient: network.publicClient,
          walletClient: network.burnerClient,
          latestBlock$: network.latestBlock$,
          storedBlockLogs$: network.storedBlockLogs$,
          worldAddress: network.worldAddress,
          worldAbi: IWorldAbi,
          write$: network.write$,
          useStore: network.useStore,
        })
      )
      .then((result) => {
        if (result) {
          unmount = result;
        }
      });

    return () => {
      if (unmount) {
        unmount();
      }
    };
  }, [network]);

  return null;
};
