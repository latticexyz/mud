import { StoreConfig, storeEventsAbi } from "@latticexyz/store";
import { Hex, TransactionReceipt } from "viem";
import { SyncOptions, SyncResult } from "./common";
import {
  createBlockStream,
  isNonPendingBlock,
  blockRangeToLogs,
  groupLogsByBlockNumber,
} from "@latticexyz/block-logs-stream";
import { filter, map, tap, mergeMap, from, concatMap, share, firstValueFrom } from "rxjs";
import { blockLogsToStorage } from "./blockLogsToStorage";
import { debug } from "./debug";
import { createIndexerClient } from "./trpc-indexer";
import { BlockLogsToStorageOptions } from "./blockLogsToStorage";

type StartSyncOptions<TConfig extends StoreConfig = StoreConfig> = SyncOptions<TConfig> & {
  storageAdapter: BlockLogsToStorageOptions<TConfig>;
};

type StartSyncResult<TConfig extends StoreConfig = StoreConfig> = SyncResult<TConfig>;

export async function startSync<TConfig extends StoreConfig = StoreConfig>({
  storageAdapter,
  config,
  address,
  publicClient,
  startBlock = 0n,
  maxBlockRange,
  initialState,
  indexerUrl,
}: StartSyncOptions<TConfig>): Promise<StartSyncResult<TConfig>> {
  if (indexerUrl != null && initialState == null) {
    const indexer = createIndexerClient({ url: indexerUrl });
    try {
      initialState = await indexer.findAll.query({
        chainId: publicClient.chain.id,
        address,
      });
    } catch (error) {
      debug("couldn't get initial state from indexer", error);
    }
  }

  if (initialState != null && initialState.blockNumber != null) {
    debug("hydrating from initial state to block", initialState.blockNumber);
    startBlock = initialState.blockNumber + 1n;

    // TODO: call storage adapter with initial state?
  }

  // TODO: if startBlock is still 0, find via deploy event

  debug("starting sync from block", startBlock);

  const latestBlock$ = createBlockStream({ publicClient, blockTag: "latest" }).pipe(share());

  const latestBlockNumber$ = latestBlock$.pipe(
    filter(isNonPendingBlock),
    map((block) => block.number),
    share()
  );

  let latestBlockNumber: bigint | null = null;
  const blockLogs$ = latestBlockNumber$.pipe(
    tap((blockNumber) => {
      debug("latest block number", blockNumber);
      latestBlockNumber = blockNumber;
    }),
    map((blockNumber) => ({ startBlock, endBlock: blockNumber })),
    blockRangeToLogs({
      publicClient,
      address,
      events: storeEventsAbi,
      maxBlockRange,
    }),
    mergeMap(({ toBlock, logs }) => from(groupLogsByBlockNumber(logs, toBlock))),
    share()
  );

  let lastBlockNumberProcessed: bigint | null = null;
  const blockStorageOperations$ = blockLogs$.pipe(
    concatMap(blockLogsToStorage(storageAdapter)),
    tap(({ blockNumber, operations }) => {
      debug("stored", operations.length, "operations for block", blockNumber);
      lastBlockNumberProcessed = blockNumber;
    }),
    share()
  );

  // Start the sync
  const sub = blockStorageOperations$.subscribe();

  async function waitForTransaction(tx: Hex): Promise<{
    receipt: TransactionReceipt;
  }> {
    // Wait for tx to be mined
    const receipt = await publicClient.waitForTransactionReceipt({ hash: tx });

    // If we haven't processed a block yet or we haven't processed the block for the tx, wait for it
    if (lastBlockNumberProcessed == null || lastBlockNumberProcessed < receipt.blockNumber) {
      await firstValueFrom(
        blockStorageOperations$.pipe(
          filter(({ blockNumber }) => blockNumber != null && blockNumber >= receipt.blockNumber)
        )
      );
    }

    return { receipt };
  }

  return {
    latestBlock$,
    latestBlockNumber$,
    blockLogs$,
    blockStorageOperations$,
    waitForTransaction,
    destroy: (): void => {
      sub.unsubscribe();
    },
  };
}
