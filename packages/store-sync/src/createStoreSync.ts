import { ConfigToKeyPrimitives, ConfigToValuePrimitives, StoreConfig, storeEventsAbi } from "@latticexyz/store";
import { Hex, TransactionReceipt } from "viem";
import { SetRecordOperation, SyncOptions, SyncResult } from "./common";
import { createBlockStream, blockRangeToLogs, groupLogsByBlockNumber } from "@latticexyz/block-logs-stream";
import { filter, map, tap, mergeMap, from, concatMap, share, firstValueFrom } from "rxjs";
import { blockLogsToStorage } from "./blockLogsToStorage";
import { debug as parentDebug } from "./debug";
import { createIndexerClient } from "./trpc-indexer";
import { BlockLogsToStorageOptions } from "./blockLogsToStorage";
import { SyncStep } from "./SyncStep";

const debug = parentDebug.extend("createStoreSync");

type CreateStoreSyncOptions<TConfig extends StoreConfig = StoreConfig> = SyncOptions<TConfig> & {
  storageAdapter: BlockLogsToStorageOptions<TConfig>;
  onProgress?: (opts: {
    step: SyncStep;
    percentage: number;
    latestBlockNumber: bigint;
    lastBlockNumberProcessed: bigint;
  }) => void;
};

type CreateStoreSyncResult<TConfig extends StoreConfig = StoreConfig> = SyncResult<TConfig>;

export async function createStoreSync<TConfig extends StoreConfig = StoreConfig>({
  storageAdapter,
  onProgress,
  address,
  publicClient,
  startBlock = 0n,
  maxBlockRange,
  initialState,
  indexerUrl,
}: CreateStoreSyncOptions<TConfig>): Promise<CreateStoreSyncResult<TConfig>> {
  if (indexerUrl != null && initialState == null) {
    try {
      const indexer = createIndexerClient({ url: indexerUrl });
      const chainId = publicClient.chain?.id ?? (await publicClient.getChainId());
      initialState = await indexer.findAll.query({ chainId, address });
    } catch (error) {
      debug("couldn't get initial state from indexer", error);
    }
  }

  if (initialState != null) {
    const { blockNumber, tables } = initialState;
    if (blockNumber != null) {
      debug("hydrating from initial state to block", initialState.blockNumber);
      startBlock = blockNumber + 1n;

      await storageAdapter.registerTables({ blockNumber, tables });

      const numRecords = initialState.tables.reduce((sum, table) => sum + table.records.length, 0);
      const recordsPerProgressUpdate = Math.floor(numRecords / 100);
      let recordsProcessed = 0;
      let recordsProcessedSinceLastUpdate = 0;

      for (const table of initialState.tables) {
        await storageAdapter.storeOperations({
          blockNumber,
          operations: table.records.map(
            (record) =>
              ({
                type: "SetRecord",
                address: table.address,
                namespace: table.namespace,
                name: table.name,
                key: record.key as ConfigToKeyPrimitives<TConfig, typeof table.name>,
                value: record.value as ConfigToValuePrimitives<TConfig, typeof table.name>,
              } as const satisfies SetRecordOperation<TConfig>)
          ),
        });

        recordsProcessed += table.records.length;
        recordsProcessedSinceLastUpdate += table.records.length;

        if (recordsProcessedSinceLastUpdate > recordsPerProgressUpdate) {
          recordsProcessedSinceLastUpdate = 0;
          onProgress?.({
            step: SyncStep.SNAPSHOT,
            percentage: (recordsProcessed / numRecords) * 100,
            latestBlockNumber: 0n,
            lastBlockNumberProcessed: blockNumber,
          });
        }

        debug(`hydrated ${table.records.length} records for table ${table.namespace}:${table.name}`);
      }
    }
  }

  // TODO: if startBlock is still 0, find via deploy event

  debug("starting sync from block", startBlock);

  const latestBlock$ = createBlockStream({ publicClient, blockTag: "latest" }).pipe(share());
  const latestBlockNumber$ = latestBlock$.pipe(
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

      if (latestBlockNumber != null) {
        if (blockNumber < latestBlockNumber) {
          onProgress?.({
            step: SyncStep.RPC,
            percentage: Number((lastBlockNumberProcessed * 1000n) / (latestBlockNumber * 1000n)) / 100,
            latestBlockNumber,
            lastBlockNumberProcessed,
          });
        } else {
          onProgress?.({
            step: SyncStep.LIVE,
            percentage: 100,
            latestBlockNumber,
            lastBlockNumberProcessed,
          });
        }
      }
    }),
    share()
  );

  async function waitForTransaction(tx: Hex): Promise<{
    receipt: TransactionReceipt;
  }> {
    // Wait for tx to be mined
    debug("waiting for tx receipt", tx);
    const receipt = await publicClient.waitForTransactionReceipt({ hash: tx });
    debug("got tx receipt", tx, receipt);

    // If we haven't processed a block yet or we haven't processed the block for the tx, wait for it
    if (lastBlockNumberProcessed == null || lastBlockNumberProcessed < receipt.blockNumber) {
      debug("waiting for tx block to be processed", tx, receipt.blockNumber);
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
  };
}
