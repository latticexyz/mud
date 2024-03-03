import { useEffect } from "react";
import { useMUD } from "./useMUD";
import IWorldAbi from "contracts/out/IWorld.sol/IWorld.abi.json";
import mudConfig from "contracts/mud.config";

// Displays dev-tools for the burner wallet
export function DevTools() {
  const { network, burner } = useMUD();

  useEffect(() => {
    if (!burner) return;

    // TODO: Handle unmount properly by updating the dev-tools implementation.
    let unmount: (() => void) | null = null;

    import("@latticexyz/dev-tools")
      .then(({ mount }) =>
        mount({
          config: mudConfig,
          publicClient: network.publicClient,
          walletClient: burner.walletClient,
          latestBlock$: network.latestBlock$,
          storedBlockLogs$: network.storedBlockLogs$,
          worldAddress: network.worldAddress,
          worldAbi: IWorldAbi,
          write$: burner.write$,
          useStore: network.useStore,
        }),
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
  }, [network, burner]);

  return null;
}
