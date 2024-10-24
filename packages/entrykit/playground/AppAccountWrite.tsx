import { useEntryKitConfig } from "../src/EntryKitConfigProvider";
import { usePreparedAppAccountClient } from "../src/usePreparedAppAccountClient";
import { getContract } from "viem";
import { mockGameAbi } from "./mockGame";
import { useMemo } from "react";
import { waitForTransactionReceipt } from "viem/actions";
import { getAction } from "viem/utils";
import { useClient } from "wagmi";

export function AppAccountWrite() {
  const { chainId, worldAddress } = useEntryKitConfig();
  const client = useClient({ chainId });
  const appAccountClient = usePreparedAppAccountClient();

  const worldContract = useMemo(
    () =>
      appAccountClient
        ? getContract({
            client: appAccountClient,
            address: worldAddress,
            abi: mockGameAbi,
          })
        : null,
    [appAccountClient, worldAddress],
  );

  return (
    <div>
      <button
        disabled={!client || !worldContract}
        onClick={async () => {
          if (!client) throw new Error("Client not ready.");
          if (!worldContract) throw new Error("World contract not ready");

          console.log("writing from app account");
          const hash = await worldContract.write.move([2, 2]);
          console.log("got tx", hash);
          const receipt = await getAction(client, waitForTransactionReceipt, "waitForTransactionReceipt")({ hash });
          console.log("got receipt", receipt);
        }}
      >
        App account write
      </button>
      <p>world: {worldAddress}</p>
      <p>app account: {appAccountClient?.account.address}</p>
    </div>
  );
}
