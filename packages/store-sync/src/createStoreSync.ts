import { storeEventsAbi } from "@latticexyz/store";
import { GetTransactionReceiptErrorType, Hex } from "viem";
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
import { createBlockStream } from "@latticexyz/block-logs-stream";
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
  scan,
  mergeMap,
  throwError,
} from "rxjs";
import { debug as parentDebug } from "./debug";
import { SyncStep } from "./SyncStep";
import { bigIntMax, chunk, isDefined, waitForIdle } from "@latticexyz/common/utils";
import { getSnapshot } from "./getSnapshot";
import { fetchAndStoreLogs } from "./fetchAndStoreLogs";
import { Store as StoreConfig } from "@latticexyz/store";
import { eventSource } from "./eventSource";

const debug = parentDebug.extend("createStoreSync");

const defaultFilters: SyncFilter[] = internalTableIds.map((tableId) => ({ tableId }));

type CreateStoreSyncOptions<config extends StoreConfig = StoreConfig> = SyncOptions<config> & {
  storageAdapter: StorageAdapter;
  onProgress?: (opts: {
    step: SyncStep;
    percentage: number;
    latestBlockNumber: bigint;
    lastBlockNumberProcessed: bigint;
    message: string;
  }) => void;
};

export async function createStoreSync<config extends StoreConfig = StoreConfig>({
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
  indexerUrl: indexerUrlInput,
}: CreateStoreSyncOptions<config>): Promise<SyncResult> {
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

  const indexerUrl =
    indexerUrlInput !== false
      ? indexerUrlInput ??
        (publicClient.chain && "indexerUrl" in publicClient.chain && typeof publicClient.chain.indexerUrl === "string"
          ? publicClient.chain.indexerUrl
          : undefined)
      : undefined;

  const chainId = publicClient.chain?.id ?? (await publicClient.getChainId());

  const initialBlockLogs$ = defer(async (): Promise<StorageAdapterBlock | undefined> => {
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
      indexerUrl,
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

  const indexerLogs$ = indexerUrl
    ? eventSource<string>(
        new URL(
          `/api/logs-live?input=${encodeURIComponent(JSON.stringify({ chainId, address, filters }))}&block_num=${}&include_tx_hash=true`,
          indexerUrl,
        ),
      ).pipe(
        map((messageEvent) => {
          const { blockNumber, logs } = JSON.parse(messageEvent.data);
          return {
            blockNumber,
            // TODO: change API to return `transactionHash` instead of `txHash`
            logs: logs.map((log: { txHash: string }) => ({ ...log, transactionHash: log.txHash })),
          } satisfies StorageAdapterBlock;
        }),
      )
    : throwError(() => new Error("No indexer URL provided"));

  const rpcLogs$ = combineLatest([startBlock$, latestBlockNumber$]).pipe(
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
        logFilter,
      });

      return from(storedBlocks);
    }),
  );

  const logs$ = indexerLogs$.pipe(
    catchError((e) => {
      debug("error streaming logs from indexer:", e);
      debug("falling back to streaming logs from ETH RPC");
      return rpcLogs$;
    }),
  );

  const storedBlock$ = logs$.pipe(
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
    share(),
  );

  const storedBlockLogs$ = concat(storedInitialBlockLogs$, storedBlock$).pipe(share());

  // keep 10 blocks worth processed transactions in memory
  const recentBlocksWindow = 10;
  // most recent block first, for ease of pulling the first one off the array
  const recentBlocks$ = storedBlockLogs$.pipe(
    scan<StorageAdapterBlock, StorageAdapterBlock[]>(
      (recentBlocks, block) => [block, ...recentBlocks].slice(0, recentBlocksWindow),
      [],
    ),
    filter((recentBlocks) => recentBlocks.length > 0),
    shareReplay(1),
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
          debug("fetching tx receipt for block", lastBlock.blockNumber);
          const { status, blockNumber, transactionHash } = await publicClient.getTransactionReceipt({ hash: tx });
          if (lastBlock.blockNumber >= blockNumber) {
            return { status, blockNumber, transactionHash };
          }
        } catch (e) {
          const error = e as GetTransactionReceiptErrorType;

          if (error.name === "TransactionReceiptNotFoundError") {
            return;
          }

          throw error;
        }
      }),
      tap((result) => debug("has tx?", tx, result)),
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
