import { ConfigToKeyPrimitives, ConfigToValuePrimitives, StoreConfig, storeEventsAbi } from "@latticexyz/store";
import { Hex, TransactionReceiptNotFoundError } from "viem";
import { SetRecordOperation, StorageAdapter, SyncOptions, SyncResult, TableWithRecords } from "./common";
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
  scan,
  identity,
} from "rxjs";
import { BlockStorageOperations, blockLogsToStorage } from "./blockLogsToStorage";
import { debug as parentDebug } from "./debug";
import { createIndexerClient } from "./trpc-indexer";
import { SyncStep } from "./SyncStep";
import { chunk, isDefined } from "@latticexyz/common/utils";

const debug = parentDebug.extend("createStoreSync");

type CreateStoreSyncOptions<TConfig extends StoreConfig = StoreConfig> = SyncOptions<TConfig> & {
  storageAdapter: StorageAdapter<TConfig>;
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

  // keep 10 blocks worth processed transactions in memory
  const recentBlocksWindow = 10;
  // most recent block first, for ease of pulling the first one off the array
  const recentBlocks$ = blockStorageOperations$.pipe(
    scan<BlockStorageOperations, BlockStorageOperations[]>(
      (recentBlocks, block) => [block, ...recentBlocks].slice(0, recentBlocksWindow),
      []
    ),
    filter((recentBlocks) => recentBlocks.length > 0),
    shareReplay(1)
  );

  // TODO: move to its own file so we can test it, have its own debug instance, etc.
  async function waitForTransaction(tx: Hex): Promise<void> {
    debug("waiting for tx", tx);

    // This currently blocks for async call on each block processed
    // We could potentially speed this up a tiny bit by racing to see if 1) tx exists in processed block or 2) fetch tx receipt for latest block processed
    const hasTransaction$ = recentBlocks$.pipe(
      concatMap(async (blocks) => {
        const txs = blocks.flatMap((block) => block.operations.map((op) => op.log?.transactionHash).filter(isDefined));
        if (txs.includes(tx)) return true;

        try {
          const lastBlock = blocks[0];
          debug("fetching tx receipt for block", lastBlock.blockNumber);
          const receipt = await publicClient.getTransactionReceipt({ hash: tx });
          return lastBlock.blockNumber >= receipt.blockNumber;
        } catch (error) {
          if (error instanceof TransactionReceiptNotFoundError) {
            return false;
          }
          throw error;
        }
      }),
      tap((result) => debug("has tx?", tx, result))
    );

    await firstValueFrom(hasTransaction$.pipe(filter(identity)));
  }

  return {
    latestBlock$,
    latestBlockNumber$,
    blockLogs$,
    blockStorageOperations$,
    waitForTransaction,
  };
}
