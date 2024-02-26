import {
  createPublicClient,
  fallback,
  webSocket,
  http,
  type ClientConfig,
  createWalletClient,
  publicActions,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { Subject, share } from "rxjs";
import { syncToZustand } from "@latticexyz/store-sync/zustand";
import { getNetworkConfig } from "./getNetworkConfig";
import { transportObserver, type ContractWrite, getBurnerPrivateKey } from "@latticexyz/common";
import mudConfig from "contracts/mud.config";
import { burnerActions, setupObserverActions } from "./customClient";

export type SetupNetworkResult = Awaited<ReturnType<typeof setupNetwork>>;
export type BurnerClient = SetupNetworkResult["burnerClient"];

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

  const burnerClient = createWalletClient({
    ...clientOptions,
    account: privateKeyToAccount(getBurnerPrivateKey("mud:example:burnerWallet")),
  })
    .extend(publicActions)
    .extend(burnerActions)
    .extend(setupObserverActions(onWrite));

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
    burnerClient,
  };
}
