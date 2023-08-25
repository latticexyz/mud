import { ConfigToKeyPrimitives, ConfigToValuePrimitives, StoreConfig, storeEventsAbi } from "@latticexyz/store";
import { Hex, TransactionReceipt, WaitForTransactionReceiptTimeoutError } from "viem";
import { SetRecordOperation, SyncOptions, SyncResult, TableWithRecords } from "./common";
import { createBlockStream, blockRangeToLogs, groupLogsByBlockNumber } from "@latticexyz/block-logs-stream";
import {
  filter,
  map,
  tap,
  mergeMap,
  from,
  concat,
  concatMap,
  share,
  firstValueFrom,
  defer,
  of,
  catchError,
  shareReplay,
  combineLatest,
} from "rxjs";
import pRetry from "p-retry";
import { blockLogsToStorage } from "./blockLogsToStorage";
import { debug as parentDebug } from "./debug";
import { createIndexerClient } from "./trpc-indexer";
import { BlockLogsToStorageOptions } from "./blockLogsToStorage";
import { SyncStep } from "./SyncStep";
import { chunk } from "@latticexyz/common/utils";

const debug = parentDebug.extend("createStoreSync");

type CreateStoreSyncOptions<TConfig extends StoreConfig = StoreConfig> = SyncOptions<TConfig> & {
  storageAdapter: BlockLogsToStorageOptions<TConfig>;
  onProgress?: (opts: {
    step: SyncStep;
    percentage: number;
    latestBlockNumber: bigint;
    lastBlockNumberProcessed: bigint;
    message: string;
  }) => void;
};

type CreateStoreSyncResult<TConfig extends StoreConfig = StoreConfig> = SyncResult<TConfig>;

export async function createStoreSync<TConfig extends StoreConfig = StoreConfig>({
  storageAdapter,
  onProgress,
  address,
  publicClient,
  startBlock: initialStartBlock = 0n,
  maxBlockRange,
  initialState,
  indexerUrl,
}: CreateStoreSyncOptions<TConfig>): Promise<CreateStoreSyncResult<TConfig>> {
  const initialState$ = defer(
    async (): Promise<
      | {
          blockNumber: bigint | null;
          tables: TableWithRecords[];
        }
      | undefined
    > => {
      if (initialState) return initialState;
      if (!indexerUrl) return;

      debug("fetching initial state from indexer", indexerUrl);

      onProgress?.({
        step: SyncStep.SNAPSHOT,
        percentage: 0,
        latestBlockNumber: 0n,
        lastBlockNumberProcessed: 0n,
        message: "Fetching snapshot from indexer",
      });

      const indexer = createIndexerClient({ url: indexerUrl });
      const chainId = publicClient.chain?.id ?? (await publicClient.getChainId());
      const result = await indexer.findAll.query({ chainId, address });

      onProgress?.({
        step: SyncStep.SNAPSHOT,
        percentage: 100,
        latestBlockNumber: 0n,
        lastBlockNumberProcessed: 0n,
        message: "Fetched snapshot from indexer",
      });

      return result;
    }
  ).pipe(
    catchError((error) => {
      debug("error fetching initial state from indexer", error);

      onProgress?.({
        step: SyncStep.SNAPSHOT,
        percentage: 100,
        latestBlockNumber: 0n,
        lastBlockNumberProcessed: initialStartBlock,
        message: "Failed to fetch snapshot from indexer",
      });

      return of(undefined);
    }),
    shareReplay(1)
  );

  const startBlock$ = initialState$.pipe(
    map((initialState) => initialState?.blockNumber ?? initialStartBlock),
    // TODO: if start block is still 0, find via deploy event
    tap((startBlock) => debug("starting sync from block", startBlock))
  );

  const initialStorageOperations$ = initialState$.pipe(
    filter(
      (initialState): initialState is { blockNumber: bigint; tables: TableWithRecords[] } =>
        initialState != null && initialState.blockNumber != null && initialState.tables.length > 0
    ),
    concatMap(async ({ blockNumber, tables }) => {
      debug("hydrating from initial state to block", blockNumber);

      onProgress?.({
        step: SyncStep.SNAPSHOT,
        percentage: 0,
        latestBlockNumber: 0n,
        lastBlockNumberProcessed: blockNumber,
        message: "Hydrating from snapshot",
      });

      await storageAdapter.registerTables({ blockNumber, tables });

      const operations: SetRecordOperation<TConfig>[] = tables.flatMap((table) =>
        table.records.map((record) => ({
          type: "SetRecord",
          address: table.address,
          namespace: table.namespace,
          name: table.name,
          key: record.key as ConfigToKeyPrimitives<TConfig, typeof table.name>,
          value: record.value as ConfigToValuePrimitives<TConfig, typeof table.name>,
        }))
      );

      // Split snapshot operations into chunks so we can update the progress callback (and ultimately render visual progress for the user).
      // This isn't ideal if we want to e.g. batch load these into a DB in a single DB tx, but we'll take it.
      //
      // Split into 50 equal chunks (for better `onProgress` updates) but only if we have 100+ items per chunk
      const chunkSize = Math.max(100, Math.floor(operations.length / 50));
      const chunks = Array.from(chunk(operations, chunkSize));
      for (const [i, chunk] of chunks.entries()) {
        await storageAdapter.storeOperations({ blockNumber, operations: chunk });
        onProgress?.({
          step: SyncStep.SNAPSHOT,
          percentage: (i + chunk.length) / chunks.length,
          latestBlockNumber: 0n,
          lastBlockNumberProcessed: blockNumber,
          message: "Hydrating from snapshot",
        });
      }

      onProgress?.({
        step: SyncStep.SNAPSHOT,
        percentage: 100,
        latestBlockNumber: 0n,
        lastBlockNumberProcessed: blockNumber,
        message: "Hydrated from snapshot",
      });

      return { blockNumber, operations };
    }),
    shareReplay(1)
  );

  const latestBlock$ = createBlockStream({ publicClient, blockTag: "latest" }).pipe(shareReplay(1));
  const latestBlockNumber$ = latestBlock$.pipe(
    map((block) => block.number),
    tap((blockNumber) => {
      debug("latest block number", blockNumber);
    }),
    shareReplay(1)
  );

  let startBlock: bigint | null = null;
  let endBlock: bigint | null = null;
  const blockLogs$ = combineLatest([startBlock$, latestBlockNumber$]).pipe(
    map(([startBlock, endBlock]) => ({ startBlock, endBlock })),
    tap((range) => {
      startBlock = range.startBlock;
      endBlock = range.endBlock;
    }),
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
  const blockStorageOperations$ = concat(
    initialStorageOperations$,
    blockLogs$.pipe(
      concatMap(blockLogsToStorage(storageAdapter)),
      tap(({ blockNumber, operations }) => {
        debug("stored", operations.length, "operations for block", blockNumber);
        lastBlockNumberProcessed = blockNumber;

        if (startBlock != null && endBlock != null) {
          if (blockNumber < endBlock) {
            const totalBlocks = endBlock - startBlock;
            const processedBlocks = lastBlockNumberProcessed - startBlock;
            onProgress?.({
              step: SyncStep.RPC,
              percentage: Number((processedBlocks * 1000n) / totalBlocks) / 1000,
              latestBlockNumber: endBlock,
              lastBlockNumberProcessed,
              message: "Hydrating from RPC",
            });
          } else {
            onProgress?.({
              step: SyncStep.LIVE,
              percentage: 100,
              latestBlockNumber: endBlock,
              lastBlockNumberProcessed,
              message: "All caught up!",
            });
          }
        }
      })
    )
  ).pipe(share());

  async function waitForTransaction(tx: Hex): Promise<{
    receipt: TransactionReceipt;
  }> {
    // viem doesn't retry timeouts, so we'll wrap in a retry
    const receipt = await pRetry(
      (attempt) => {
        // Wait for tx to be mined
        debug("waiting for tx receipt", tx, "attempt", attempt);
        return publicClient.waitForTransactionReceipt({
          hash: tx,
          timeout: publicClient.pollingInterval * 2 * attempt,
        });
      },
      {
        retries: 3,
        onFailedAttempt: (error) => {
          if (error instanceof WaitForTransactionReceiptTimeoutError) {
            debug("timed out waiting for tx receipt, trying again", tx);
            return;
          }
          throw error;
        },
      }
    );
    debug("got tx receipt", tx, receipt);

    // If we haven't processed a block yet or we haven't processed the block for the tx, wait for it
    if (lastBlockNumberProcessed == null || lastBlockNumberProcessed < receipt.blockNumber) {
      debug("waiting for tx block to be processed", tx, receipt.blockNumber);
      await firstValueFrom(
        blockStorageOperations$.pipe(filter(({ blockNumber }) => blockNumber >= receipt.blockNumber))
      );
    }
    debug("tx block was processed", tx, receipt.blockNumber);

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
