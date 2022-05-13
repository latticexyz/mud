import { ethers } from "ethers";
import { Subject } from "rxjs";
import { ContractEvent, ContractTopics } from "./createContractsEventStream";
import { fetchEventsInBlockRange } from "./networkUtils";
import { Contracts } from "./types";

export type Sync<C extends Contracts> = {
  sync: (
    provider: ethers.providers.JsonRpcProvider,
    topics: ContractTopics<C>[],
    blockNumber: number,
    contracts: C,
    supportsBatchQueries: boolean
  ) => Promise<ContractEvent<C>[]>;
  lastSyncedBlockNumber: number;
  syncing: boolean;
};

export function createStatefulSync<C extends Contracts>(
  startBlockNumber: number,
  lastSyncedBlockNumberSubject$: Subject<number>
): Sync<C> {
  let syncing = false;
  let lastSyncedBlockNumber = startBlockNumber;
  const sync = async (
    provider: ethers.providers.JsonRpcProvider,
    topics: ContractTopics<C>[],
    blockNumber: number,
    contracts: C,
    supportsBatchQueries: boolean
  ) => {
    if (syncing) {
      throw new Error("Stateful sync already syncinc");
    }
    syncing = true;
    const events = await fetchEventsInBlockRange(
      provider,
      topics,
      lastSyncedBlockNumber + 1,
      blockNumber,
      contracts,
      supportsBatchQueries
    );
    lastSyncedBlockNumber = blockNumber;
    lastSyncedBlockNumberSubject$.next(lastSyncedBlockNumber);
    syncing = false;
    return events;
  };
  return {
    sync,
    lastSyncedBlockNumber,
    syncing,
  };
}
