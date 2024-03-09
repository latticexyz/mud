import { useEffect } from "react";
import { useMUD } from "./useMUD";
import mudConfig from "contracts/mud.config";

// Displays dev-tools connected to the burner wallet
export function DevTools() {
  const { network, burner } = useMUD();

  useEffect(() => {
    if (!burner) return;

    let unmount: (() => void) | undefined;

    import("@latticexyz/dev-tools")
      .then(({ mount }) =>
        mount({
          config: mudConfig,
          publicClient: network.publicClient,
          walletClient: burner.walletClient,
          latestBlock$: network.latestBlock$,
          storedBlockLogs$: network.storedBlockLogs$,
          worldAddress: network.worldAddress,
          worldAbi: burner.worldContract.abi,
          write$: burner.write$,
          useStore: network.useStore,
        }),
      )
      .then((result) => {
        unmount = result;
      });

    return () => {
      if (unmount) {
        unmount();
      }
    };
  }, [network, burner]);

  return null;
}
