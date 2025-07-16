import { useEntryKitConfig } from "../src/EntryKitConfigProvider";
import { useSessionClientReady } from "../src/useSessionClientReady";
import { getContract, Hex, TransactionReceipt } from "viem";
import { mockGameAbi } from "./mockGame";
import { useMemo, useState } from "react";
import { waitForTransactionReceipt } from "viem/actions";
import { getAction } from "viem/utils";
import { useClient } from "wagmi";

export function SessionWrite() {
  const { chainId, worldAddress } = useEntryKitConfig();
  const client = useClient({ chainId });
  const { data: sessionClient } = useSessionClientReady();
  const [hash, setHash] = useState<Hex | null>(null);
  const [receipt, setReceipt] = useState<TransactionReceipt | null>(null);
  const [duration, setDuration] = useState<number | null>(null);

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
          if (!sessionClient) throw new Error("Session client not ready.");
          if (!worldContract) throw new Error("World contract not ready");

          const start = performance.now();
          console.log("writing from session account");
          const hash = await worldContract.write.move([2, 2]);
          setHash(hash);
          console.log("got tx", hash);
          const receipt = await getAction(
            sessionClient,
            waitForTransactionReceipt,
            "waitForTransactionReceipt",
          )({ hash });
          const end = performance.now();
          setReceipt(receipt);
          console.log("got receipt", receipt);
          setDuration(end - start);
        }}
      >
        Session write
      </button>
      <p>world: {worldAddress}</p>
      <p>session: {sessionClient?.account.address}</p>
      session tx: {hash ?? "??"} ({receipt?.status ?? "??"} in {duration ?? "??"}ms)
    </div>
  );
}
