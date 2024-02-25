import { createPublicClient, fallback, webSocket, http, type ClientConfig } from "viem";
import { Subject, share } from "rxjs";
import { syncToZustand } from "@latticexyz/store-sync/zustand";
import { getNetworkConfig } from "./getNetworkConfig";
import { transportObserver, type ContractWrite } from "@latticexyz/common";
import mudConfig from "contracts/mud.config";

export type SetupNetworkResult = Awaited<ReturnType<typeof setupNetwork>>;

export async function setupNetwork() {
  const networkConfig = getNetworkConfig();

  const clientOptions = {
    chain: networkConfig.chain,
    transport: transportObserver(fallback([webSocket(), http()])),
    pollingInterval: 1000,
  } as const satisfies ClientConfig;

  const publicClient = createPublicClient(clientOptions);

  const { tables, useStore, latestBlock$, storedBlockLogs$, waitForTransaction } = await syncToZustand({
    config: mudConfig,
    address: networkConfig.worldAddress,
    publicClient,
    startBlock: BigInt(networkConfig.initialBlockNumber),
  });

  const write$ = new Subject<ContractWrite>();
  let nextWriteId = 0;
  const onWrite = (write: ContractWrite) =>
    write$.next({ id: `${write.id}:${nextWriteId++}`, request: write.request, result: write.result });

  return {
    worldAddress: networkConfig.worldAddress,
    tables,
    useStore,
    publicClient,
    latestBlock$,
    storedBlockLogs$,
    waitForTransaction,
    onWrite,
    write$: write$.asObservable().pipe(share()),
  };
}
