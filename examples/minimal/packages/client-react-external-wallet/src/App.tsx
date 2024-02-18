import { useEffect } from "react";
import { useMUDRead } from "./mud/read";
import { useMUDWrite } from "./mud/write";

export const App = () => {
  const mudRead = useMUDRead();
  const mudWrite = useMUDWrite();

  const counter = mudRead.useStore((state) => state.getValue(mudRead.tables.CounterTable, {}));

  useEffect(() => {
    if (import.meta.env.DEV) {
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
    }
  }, [mudWrite?.walletClient.account.address]);

  return (
    <div>
      <div>Counter: {counter?.value ?? "unset"}</div>
      <div>
        {mudWrite && (
          <button type="button" onClick={() => mudWrite.systemCalls.increment()}>
            Increment
          </button>
        )}
      </div>
    </div>
  );
};
