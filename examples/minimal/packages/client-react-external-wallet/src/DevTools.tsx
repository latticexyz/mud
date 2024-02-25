import { useEffect } from "react";
import { useMUD } from "./mud/customWalletClient";
import IWorldAbi from "contracts/out/IWorld.sol/IWorld.abi.json";
import mudConfig from "contracts/mud.config";

export const DevTools = () => {
  const { network, walletClient } = useMUD();

  useEffect(() => {
    if (!walletClient) return;

    // TODO: Handle unmount properly by updating the dev-tools implementation.
    let unmount: (() => void) | null = null;

    import("@latticexyz/dev-tools")
      .then(({ mount }) =>
        mount({
          config: mudConfig,
          publicClient: network.publicClient,
          walletClient: walletClient,
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
  }, [walletClient?.account.address]);

  return null;
};
