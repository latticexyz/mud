import { storeEventsAbi } from "@latticexyz/store";
import { GetTransactionReceiptErrorType, Hex, parseEventLogs } from "viem";
import {
  StorageAdapter,
  StorageAdapterBlock,
  StoreEventsLog,
  SyncFilter,
  SyncOptions,
  SyncResult,
  internalTableIds,
  WaitForTransactionResult,
} from "./common";
import { createBlockStream, groupLogsByBlockNumber } from "@latticexyz/block-logs-stream";
import {
  filter,
  map,
  tap,
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
  mergeMap,
  BehaviorSubject,
  switchMap,
  ignoreElements,
} from "rxjs";
import { debug as parentDebug } from "./debug";
import { SyncStep } from "./SyncStep";
import { bigIntMax, chunk, isDefined, waitForIdle } from "@latticexyz/common/utils";
import { getSnapshot } from "./getSnapshot";
import { fetchAndStoreLogs } from "./fetchAndStoreLogs";

const debug = parentDebug.extend("createStoreSync");

const defaultFilters: SyncFilter[] = internalTableIds.map((tableId) => ({ tableId }));

type CreateStoreSyncOptions = SyncOptions & {
  storageAdapter: StorageAdapter;
  onProgress?: (opts: {
    step: SyncStep;
    percentage: number;
    latestBlockNumber: bigint;
    lastBlockNumberProcessed: bigint;
    message: string;
  }) => void;
};

export async function createStoreSync({
  storageAdapter,
  onProgress,
  publicClient,
  address,
  filters: initialFilters = [],
  tableIds = [],
  followBlockTag = "latest",
  startBlock: initialStartBlock = 0n,
  maxBlockRange,
  initialState,
  initialBlockLogs,
  indexerUrl,
}: CreateStoreSyncOptions): Promise<SyncResult> {
  const filters: SyncFilter[] =
    initialFilters.length || tableIds.length
      ? [...initialFilters, ...tableIds.map((tableId) => ({ tableId })), ...defaultFilters]
      : [];

  const logFilter = filters.length
    ? (log: StoreEventsLog): boolean =>
        filters.some(
          (filter) =>
            filter.tableId === log.args.tableId &&
            (filter.key0 == null || filter.key0 === log.args.keyTuple[0]) &&
            (filter.key1 == null || filter.key1 === log.args.keyTuple[1]),
        )
    : undefined;

  const initialBlockLogs$ = defer(async (): Promise<StorageAdapterBlock | undefined> => {
    const chainId = publicClient.chain?.id ?? (await publicClient.getChainId());

    onProgress?.({
      step: SyncStep.SNAPSHOT,
      percentage: 0,
      latestBlockNumber: 0n,
      lastBlockNumberProcessed: 0n,
      message: "Getting snapshot",
    });

    const snapshot = await getSnapshot({
      chainId,
      address,
      filters,
      initialState,
      initialBlockLogs,
      indexerUrl:
        indexerUrl !== false
          ? indexerUrl ??
            (publicClient.chain &&
            "indexerUrl" in publicClient.chain &&
            typeof publicClient.chain.indexerUrl === "string"
              ? publicClient.chain.indexerUrl
              : undefined)
          : undefined,
    });

    onProgress?.({
      step: SyncStep.SNAPSHOT,
      percentage: 100,
      latestBlockNumber: 0n,
      lastBlockNumberProcessed: 0n,
      message: "Got snapshot",
    });

    return snapshot;
  }).pipe(
    catchError((error) => {
      debug("error getting snapshot", error);

      onProgress?.({
        step: SyncStep.SNAPSHOT,
        percentage: 100,
        latestBlockNumber: 0n,
        lastBlockNumberProcessed: initialStartBlock,
        message: "Failed to get snapshot",
      });

      return of(undefined);
    }),
    shareReplay(1),
  );

  const storedInitialBlockLogs$ = initialBlockLogs$.pipe(
    filter(isDefined),
    concatMap(async ({ blockNumber, logs }) => {
      debug("hydrating", logs.length, "logs to block", blockNumber);

      onProgress?.({
        step: SyncStep.SNAPSHOT,
        percentage: 0,
        latestBlockNumber: 0n,
        lastBlockNumberProcessed: blockNumber,
        message: "Hydrating from snapshot",
      });

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
          percentage: ((i + 1) / chunks.length) * 100,
          latestBlockNumber: 0n,
          lastBlockNumberProcessed: blockNumber,
          message: "Hydrating from snapshot",
        });

        // RECS is a synchronous API so hydrating in a loop like this blocks downstream render cycles
        // that would display the percentage climbing up to 100.
        // We wait for idle callback here to give rendering a chance to complete.
        await waitForIdle();
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
    shareReplay(1),
  );

  const startBlock$ = initialBlockLogs$.pipe(
    map((block) => bigIntMax(block?.blockNumber ?? 0n, initialStartBlock)),
    // TODO: if start block is still 0, find via deploy event
    tap((startBlock) => debug("starting sync from block", startBlock)),
  );

  const latestBlock$ = createBlockStream({ publicClient, blockTag: followBlockTag }).pipe(shareReplay(1));
  const latestBlockNumber$ = latestBlock$.pipe(
    map((block) => block.number),
    tap((blockNumber) => {
      debug("on block number", blockNumber, "for", followBlockTag, "block tag");
    }),
    shareReplay(1),
  );

  let startBlock: bigint | null = null;
  let endBlock: bigint | null = null;
  let lastBlockNumberProcessed: bigint | null = null;

  // For chains that provide guaranteed receipts ahead of block mining, we can apply the logs immediately.
  // This works because, once the block is mined, the same logs will be applied. Store events are defined in
  // such a way that reapplying the same logs, even if the order changes, will mean that the storage adapter
  // is kept up to date.

  const optimisticLogs$ = new BehaviorSubject<readonly StoreEventsLog[]>([]);
  function pushOptimisticLogs(logs: readonly StoreEventsLog[]): void {
    optimisticLogs$.next(
      [...optimisticLogs$.value, ...logs].filter(
        (log) => lastBlockNumberProcessed == null || log.blockNumber > lastBlockNumberProcessed,
      ),
    );
  }

  const isStoringOptimisticLogs$ = optimisticLogs$.pipe(
    switchMap((logs) =>
      concat(
        of(true),
        of(logs).pipe(
          concatMap(async (logs) => {
            if (!logs.length) return;
            debug("applying", logs.length, "optimistic logs");
            const blocks = groupLogsByBlockNumber(
              logs.filter((log) => lastBlockNumberProcessed == null || log.blockNumber > lastBlockNumberProcessed),
            ).filter((block) => block.logs.length);
            for (const block of blocks) {
              debug("applying optimistic logs for block", block.blockNumber);
              await storageAdapter(block);
            }
          }),
          ignoreElements(),
        ),
        of(false),
      ),
    ),
  );
  const isOptimisticIdle$ = isStoringOptimisticLogs$.pipe(
    filter((isStoring) => isStoring === false),
    shareReplay(1),
  );

  const storedBlock$ = combineLatest([startBlock$, latestBlockNumber$]).pipe(
    map(([startBlock, endBlock]) => ({ startBlock, endBlock })),
    concatMap(async (range) => {
      // wait for any prior pending optimistic logs, so we don't have data conflicts
      await firstValueFrom(isOptimisticIdle$);
      return range;
    }),
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
        logFilter,
      });

      return from(storedBlocks);
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
    }),
    concatMap(async (block) => {
      // reapply optimistic logs
      pushOptimisticLogs([]);
      await firstValueFrom(isOptimisticIdle$);
      return block;
    }),
    share(),
  );

  // keep 10 blocks worth processed transactions in memory
  const recentBlocksWindow = 10;
  const recentBlocks$ = new BehaviorSubject<StorageAdapterBlock[]>([]);

  const storedBlockLogs$ = concat(storedInitialBlockLogs$, storedBlock$).pipe(
    tap((block) => {
      // most recent block first, for ease of pulling the first one off the array
      recentBlocks$.next([block, ...recentBlocks$.value].slice(0, recentBlocksWindow));
    }),
    share(),
  );

  // TODO: move to its own file so we can test it, have its own debug instance, etc.
  async function waitForTransaction(tx: Hex): Promise<WaitForTransactionResult> {
    debug("waiting for tx", tx);

    // This currently blocks for async call on each block processed
    // We could potentially speed this up a tiny bit by racing to see if 1) tx exists in processed block or 2) fetch tx receipt for latest block processed
    const hasTransaction$ = recentBlocks$.pipe(
      // We use `mergeMap` instead of `concatMap` here to send the fetch request immediately when a new block range appears,
      // instead of sending the next request only when the previous one completed.
      mergeMap(async (blocks) => {
        for (const block of blocks) {
          const txs = block.logs.map((op) => op.transactionHash);
          // If the transaction caused a log, it must have succeeded
          if (txs.includes(tx)) {
            return { blockNumber: block.blockNumber, status: "success" as const, transactionHash: tx };
          }
        }

        try {
          const lastBlock = blocks[0];
          debug("fetching tx receipt after seeing block", lastBlock.blockNumber);
          const receipt = await publicClient.getTransactionReceipt({ hash: tx });
          debug("got receipt", receipt.status);
          if (receipt.status === "success") {
            const logs = parseEventLogs({ abi: storeEventsAbi, logs: receipt.logs });
            if (logs.length) {
              debug("applying", logs.length, "optimistic logs");
              await firstValueFrom(isOptimisticIdle$);
              pushOptimisticLogs(logs);
              await firstValueFrom(isOptimisticIdle$);
            }
          }
          return {
            status: receipt.status,
            blockNumber: receipt.blockNumber,
            transactionHash: receipt.transactionHash,
          };
        } catch (e) {
          const error = e as GetTransactionReceiptErrorType;
          if (error.name === "TransactionReceiptNotFoundError") {
            return;
          }
          throw error;
        }
      }),
    );

    return await firstValueFrom(hasTransaction$.pipe(filter(isDefined)));
  }

  return {
    latestBlock$,
    latestBlockNumber$,
    storedBlockLogs$,
    waitForTransaction,
  };
}
