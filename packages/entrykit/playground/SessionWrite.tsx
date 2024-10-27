import { useEntryKitConfig } from "../src/EntryKitConfigProvider";
import { useSessionClientReady } from "../src/useSessionClientReady";
import { getContract } from "viem";
import { mockGameAbi } from "./mockGame";
import { useMemo } from "react";
import { waitForTransactionReceipt } from "viem/actions";
import { getAction } from "viem/utils";
import { useClient } from "wagmi";

export function SessionWrite() {
  const { chainId, worldAddress } = useEntryKitConfig();
  const client = useClient({ chainId });
  const { data: sessionClient } = useSessionClientReady();

  const worldContract = useMemo(
    () =>
      sessionClient
        ? getContract({
            client: sessionClient,
            address: worldAddress,
            abi: mockGameAbi,
          })
        : null,
    [sessionClient, worldAddress],
  );

  return (
    <div>
      <button
        disabled={!client || !worldContract}
        onClick={async () => {
          if (!client) throw new Error("Client not ready.");
          if (!worldContract) throw new Error("World contract not ready");

          console.log("writing from session account");
          const hash = await worldContract.write.move([2, 2]);
          console.log("got tx", hash);
          const receipt = await getAction(client, waitForTransactionReceipt, "waitForTransactionReceipt")({ hash });
          console.log("got receipt", receipt);
        }}
      >
        Session write
      </button>
      <p>world: {worldAddress}</p>
      <p>session: {sessionClient?.account.address}</p>
    </div>
  );
}
