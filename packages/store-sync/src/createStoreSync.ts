import { StoreConfig, storeEventsAbi } from "@latticexyz/store";
import { Hex, TransactionReceiptNotFoundError } from "viem";
import { StorageAdapter, StorageAdapterBlock, SyncFilter, SyncOptions, SyncResult, internalTableIds } from "./common";
import { createBlockStream, blockRangeToLogs, groupLogsByBlockNumber, fetchLogs } from "@latticexyz/block-logs-stream";
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
  of,
  shareReplay,
  combineLatest,
  scan,
  identity,
  empty,
  bufferCount,
  first,
  finalize,
  defer,
} from "rxjs";
import { debug as parentDebug } from "./debug";
import { SyncStep } from "./SyncStep";
import { bigIntMax, isDefined, wait, waitForIdle } from "@latticexyz/common/utils";
import { createEventStream } from "./createEventStream";
import { fetchAndStoreLogs } from "./fetchAndStoreLogs";

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
  initialBlockLogs,
  indexerUrl,
}: CreateStoreSyncOptions<TConfig>): Promise<SyncResult> {
  const filters: SyncFilter[] =
    initialFilters.length || tableIds.length
      ? [...initialFilters, ...tableIds.map((tableId) => ({ tableId })), ...defaultFilters]
      : [];

  // const initialBlockLogs$ = defer(async (): Promise<StorageAdapterBlock | undefined> => {
  //   const chainId = publicClient.chain?.id ?? (await publicClient.getChainId());

  //   onProgress?.({
  //     step: SyncStep.SNAPSHOT,
  //     percentage: 0,
  //     latestBlockNumber: 0n,
  //     lastBlockNumberProcessed: 0n,
  //     message: "Getting snapshot",
  //   });

  //   const snapshot = await getSnapshot({
  //     chainId,
  //     address,
  //     filters,
  //     initialState,
  //     initialBlockLogs,
  //     indexerUrl,
  //   });

  //   onProgress?.({
  //     step: SyncStep.SNAPSHOT,
  //     percentage: 100,
  //     latestBlockNumber: 0n,
  //     lastBlockNumberProcessed: 0n,
  //     message: "Got snapshot",
  //   });

  //   return snapshot;
  // }).pipe(
  //   catchError((error) => {
  //     debug("error getting snapshot", error);

  //     onProgress?.({
  //       step: SyncStep.SNAPSHOT,
  //       percentage: 100,
  //       latestBlockNumber: 0n,
  //       lastBlockNumberProcessed: initialStartBlock,
  //       message: "Failed to get snapshot",
  //     });

  //     return of(undefined);
  //   }),
  //   shareReplay(1)
  // );

  // const storedInitialBlockLogs$ = initialBlockLogs$.pipe(
  //   filter(isDefined),
  //   concatMap(async ({ blockNumber, logs }) => {
  //     debug("hydrating", logs.length, "logs to block", blockNumber);

  //     onProgress?.({
  //       step: SyncStep.SNAPSHOT,
  //       percentage: 0,
  //       latestBlockNumber: 0n,
  //       lastBlockNumberProcessed: blockNumber,
  //       message: "Hydrating from snapshot",
  //     });

  //     // Split snapshot operations into chunks so we can update the progress callback (and ultimately render visual progress for the user).
  //     // This isn't ideal if we want to e.g. batch load these into a DB in a single DB tx, but we'll take it.
  //     //
  //     // Split into 50 equal chunks (for better `onProgress` updates) but only if we have 100+ items per chunk
  //     const chunkSize = Math.max(100, Math.floor(logs.length / 50));
  //     const chunks = Array.from(chunk(logs, chunkSize));
  //     for (const [i, chunk] of chunks.entries()) {
  //       await storageAdapter({ blockNumber, logs: chunk });
  //       onProgress?.({
  //         step: SyncStep.SNAPSHOT,
  //         percentage: ((i + chunk.length) / chunks.length) * 100,
  //         latestBlockNumber: 0n,
  //         lastBlockNumberProcessed: blockNumber,
  //         message: "Hydrating from snapshot",
  //       });
  //     }

  //     onProgress?.({
  //       step: SyncStep.SNAPSHOT,
  //       percentage: 100,
  //       latestBlockNumber: 0n,
  //       lastBlockNumberProcessed: blockNumber,
  //       message: "Hydrated from snapshot",
  //     });

  //     return { blockNumber, logs };
  //   }),
  //   shareReplay(1)
  // );

  const chainId = publicClient.chain?.id ?? (await publicClient.getChainId());
  const eventStream = indexerUrl ? await createEventStream({ indexerUrl, chainId, address, filters }) : null;

  let count = 0;
  const storedInitialLogs$ = eventStream
    ? defer(() => {
        debug("hydrating", eventStream.totalLogs, "logs to block", eventStream.blockNumber);
        onProgress?.({
          step: SyncStep.SNAPSHOT,
          percentage: 0,
          latestBlockNumber: 0n,
          lastBlockNumberProcessed: 0n,
          message: "Hydrating from snapshot",
        });
        return eventStream.log$;
      }).pipe(
        bufferCount(100),
        concatMap(async (logs) => {
          count += logs.length;

          const block = { blockNumber: eventStream.blockNumber, logs };
          await storageAdapter(block);
          await waitForIdle();

          onProgress?.({
            step: SyncStep.SNAPSHOT,
            percentage: (count / eventStream.totalLogs) * 100,
            latestBlockNumber: 0n,
            lastBlockNumberProcessed: 0n,
            message: "Hydrating from snapshot",
          });

          return block;
        }),
        finalize(() => {
          debug("hydrated", eventStream.totalLogs, "logs to block", eventStream.blockNumber);
          onProgress?.({
            step: SyncStep.SNAPSHOT,
            percentage: 100,
            latestBlockNumber: 0n,
            lastBlockNumberProcessed: eventStream.blockNumber,
            message: "Hydrating from snapshot",
          });
        }),
        shareReplay(1)
      )
    : empty();

  const startBlock$ = concat(storedInitialLogs$, of(undefined)).pipe(
    first(),
    map((block) => bigIntMax(block?.blockNumber ?? 0n, initialStartBlock)),
    // TODO: if start block is still 0, find via deploy event
    tap((startBlock) => {
      console.log("starting sync from block", startBlock);
      debug("starting sync from block", startBlock);
    })
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
  let lastBlockNumberProcessed: bigint | null = null;

  const storedBlock$ = combineLatest([startBlock$, latestBlockNumber$]).pipe(
    map(([startBlock, endBlock]) => ({ startBlock, endBlock })),
    tap((range) => {
      startBlock = range.startBlock;
      endBlock = range.endBlock;
    }),
    concatMap((range) => {
      const storedBlocks = fetchAndStoreLogs({
        publicClient,
        address,
        events: storeEventsAbi,
        maxBlockRange,
        fromBlock: lastBlockNumberProcessed
          ? bigIntMax(range.startBlock, lastBlockNumberProcessed + 1n)
          : range.startBlock,
        toBlock: range.endBlock,
        storageAdapter,
        // TODO: translate filters to log topics to filter at rpc level
        logFilter: filters.length
          ? (log): boolean =>
              filters.some(
                (filter) =>
                  filter.tableId === log.args.tableId &&
                  (filter.key0 == null || filter.key0 === log.args.keyTuple[0]) &&
                  (filter.key1 == null || filter.key1 === log.args.keyTuple[1])
              )
          : undefined,
      });

      return from(storedBlocks);
    }),
    share()
  );

  const storedBlockLogs$ = concat(
    storedInitialLogs$,
    storedBlock$.pipe(
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
    storedBlockLogs$,
    waitForTransaction,
  };
}
