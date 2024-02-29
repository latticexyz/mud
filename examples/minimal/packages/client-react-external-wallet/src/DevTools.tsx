import { useEffect } from "react";
import { useMUDRead } from "./mud/read";
import { useMUDWrite } from "./mud/write";

export const DevTools = () => {
  const mudRead = useMUDRead();
  const mudWrite = useMUDWrite();

  useEffect(() => {
    if (!mudWrite) return;

    // TODO: Handle unmount properly by updating the dev-tools implementation.
    let unmount: (() => void) | null = null;

    import("@latticexyz/dev-tools")
      .then(({ mount }) =>
        mount({
          config: mudRead.mudConfig,
          publicClient: mudRead.publicClient,
          walletClient: mudWrite.walletClient,
          latestBlock$: mudRead.latestBlock$,
          storedBlockLogs$: mudRead.storedBlockLogs$,
          worldAddress: mudRead.worldAddress,
          worldAbi: mudWrite.worldContract.abi,
          write$: mudWrite.write$,
          useStore: mudRead.useStore,
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
  }, [mudWrite?.walletClient.account.address]);

  return null;
};
