import { StoreConfig, storeEventsAbi } from "@latticexyz/store";
import { Hex, TransactionReceiptNotFoundError } from "viem";
import {
  StorageAdapter,
  StorageAdapterBlock,
  StorageAdapterLog,
  SyncFilter,
  SyncOptions,
  SyncResult,
  TableWithRecords,
} from "./common";
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
import { debug as parentDebug } from "./debug";
import { createIndexerClient } from "./trpc-indexer";
import { SyncStep } from "./SyncStep";
import { chunk, isDefined } from "@latticexyz/common/utils";
import { encodeKey, encodeValueArgs } from "@latticexyz/protocol-parser";
import { internalTableIds } from "./internalTableIds";

const debug = parentDebug.extend("createStoreSync");

const defaultFilters: SyncFilter[] = internalTableIds.map((tableId) => ({ tableId }));

type CreateStoreSyncOptions<TConfig extends StoreConfig = StoreConfig> = SyncOptions<TConfig> & {
  storageAdapter: StorageAdapter;
  onProgress?: (opts: {
    step: SyncStep;
    percentage: number;
    latestBlockNumber: bigint;
    lastBlockNumberProcessed: bigint;
    message: string;
  }) => void;
};

export async function createStoreSync<TConfig extends StoreConfig = StoreConfig>({
  storageAdapter,
  onProgress,
  publicClient,
  address,
  filters: initialFilters = [],
  tableIds = [],
  startBlock: initialStartBlock = 0n,
  maxBlockRange,
  initialState,
  indexerUrl,
}: CreateStoreSyncOptions<TConfig>): Promise<SyncResult> {
  const filters: SyncFilter[] =
    initialFilters.length || tableIds.length
      ? [...initialFilters, ...tableIds.map((tableId) => ({ tableId })), ...defaultFilters]
      : [];
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
      const result = await indexer.findAll.query({ chainId, address, filters });

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

  const initialLogs$ = initialState$.pipe(
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

      const logs: StorageAdapterLog[] = tables.flatMap((table) =>
        table.records.map(
          (record): StorageAdapterLog => ({
            eventName: "Store_SetRecord",
            address: table.address,
            args: {
              tableId: table.tableId,
              keyTuple: encodeKey(table.keySchema, record.key),
              ...encodeValueArgs(table.valueSchema, record.value),
            },
          })
        )
      );

      // Split snapshot operations into chunks so we can update the progress callback (and ultimately render visual progress for the user).
      // This isn't ideal if we want to e.g. batch load these into a DB in a single DB tx, but we'll take it.
      //
      // Split into 50 equal chunks (for better `onProgress` updates) but only if we have 100+ items per chunk
      const chunkSize = Math.max(100, Math.floor(logs.length / 50));
      const chunks = Array.from(chunk(logs, chunkSize));
      for (const [i, chunk] of chunks.entries()) {
        await storageAdapter({ blockNumber, logs: chunk });
        onProgress?.({
          step: SyncStep.SNAPSHOT,
          percentage: ((i + chunk.length) / chunks.length) * 100,
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

      return { blockNumber, logs };
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
      // TODO: pass filters in here so we can filter at RPC level
      maxBlockRange,
    }),
    map(({ toBlock, logs }) => {
      if (!filters.length) return { toBlock, logs };
      const filteredLogs = logs.filter((log) =>
        filters.some(
          (filter) =>
            filter.tableId === log.args.tableId &&
            (filter.key0 == null || filter.key0 === log.args.keyTuple[0]) &&
            (filter.key1 == null || filter.key1 === log.args.keyTuple[1])
        )
      );
      return { toBlock, logs: filteredLogs };
    }),
    mergeMap(({ toBlock, logs }) => from(groupLogsByBlockNumber(logs, toBlock))),
    share()
  );

  let lastBlockNumberProcessed: bigint | null = null;
  const storedBlockLogs$ = concat(
    initialLogs$,
    blockLogs$.pipe(
      concatMap(async (block) => {
        await storageAdapter(block);
        return block;
      }),
      tap(({ blockNumber, logs }) => {
        debug("stored", logs.length, "logs for block", blockNumber);
        lastBlockNumberProcessed = blockNumber;

        if (startBlock != null && endBlock != null) {
          if (blockNumber < endBlock) {
            const totalBlocks = endBlock - startBlock;
            const processedBlocks = lastBlockNumberProcessed - startBlock;
            onProgress?.({
              step: SyncStep.RPC,
              percentage: Number((processedBlocks * 1000n) / totalBlocks) / 10,
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
  const recentBlocks$ = storedBlockLogs$.pipe(
    scan<StorageAdapterBlock, StorageAdapterBlock[]>(
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
        const txs = blocks.flatMap((block) => block.logs.map((op) => op.transactionHash).filter(isDefined));
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
    storedBlockLogs$,
    waitForTransaction,
  };
}
