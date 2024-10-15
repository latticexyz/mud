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
  merge,
} from "rxjs";
import { debug as parentDebug } from "./debug";
import { SyncStep } from "./SyncStep";
import { bigIntMax, chunk, isDefined, waitForIdle } from "@latticexyz/common/utils";
import { getSnapshot } from "./getSnapshot";
import { fromEventSource } from "./fromEventSource";
import { fetchAndStoreLogs } from "./fetchAndStoreLogs";
import { isLogsApiResponse } from "./indexer-client/isLogsApiResponse";
import { toStorageAdatperBlock } from "./indexer-client/toStorageAdapterBlock";
import { watchLogs } from "./wiresaw";

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
  indexerUrl: initialIndexerUrl,
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

  const indexerUrl =
    initialIndexerUrl !== false
      ? initialIndexerUrl ??
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

  let startBlock: bigint | null = null;
  const startBlock$ = initialBlockLogs$.pipe(
    map((block) => bigIntMax(block?.blockNumber ?? 0n, initialStartBlock)),
    // TODO: if start block is still 0, find via deploy event
    tap((blockNumber) => {
      startBlock = blockNumber;
      debug("starting sync from block", startBlock);
      return startBlock;
    }),
  );

  let latestBlockNumber: bigint | null = null;
  const latestBlock$ = createBlockStream({ publicClient, blockTag: followBlockTag }).pipe(shareReplay(1));
  const latestBlockNumber$ = latestBlock$.pipe(
    map((block) => block.number),
    tap((blockNumber) => {
      latestBlockNumber = blockNumber;
      debug("on block number", blockNumber, "for", followBlockTag, "block tag");
      return latestBlockNumber;
    }),
    shareReplay(1),
  );

  let lastBlockNumberProcessed: bigint | null = null;
  let caughtUp = false;

  const pendingLogsWebSocketUrl = publicClient.chain?.rpcUrls?.wiresaw?.webSocket?.[0];
  const storedPendingLogs$ = pendingLogsWebSocketUrl
    ? merge(
        startBlock$.pipe(
          mergeMap((startBlock) => watchLogs({ url: pendingLogsWebSocketUrl, address, fromBlock: startBlock }).logs$),
          concatMap(async (block) => {
            await storageAdapter(block);
            return block;
          }),
        ),
        // The watchLogs API doesn't emit on empty logs, but consumers expect an emission on empty logs
        latestBlockNumber$.pipe(
          filter(() => caughtUp),
          map((blockNumber) => ({ blockNumber, logs: [] })),
        ),
      )
    : throwError(() => new Error("No pending logs WebSocket RPC URL provided"));

  const storedIndexerLogs$ = indexerUrl
    ? startBlock$.pipe(
        mergeMap((startBlock) => {
          const url = new URL(
            `api/logs-live?${new URLSearchParams({
              input: JSON.stringify({ chainId, address, filters }),
              block_num: startBlock.toString(),
              include_tx_hash: "true",
            })}`,
            indexerUrl,
          );
          return fromEventSource<string>(url);
        }),
        map((messageEvent) => {
          const data = JSON.parse(messageEvent.data);
          if (!isLogsApiResponse(data)) {
            throw new Error("Received unexpected from indexer:" + messageEvent.data);
          }
          return toStorageAdatperBlock(data);
        }),
        concatMap(async (block) => {
          await storageAdapter(block);
          return block;
        }),
      )
    : throwError(() => new Error("No indexer URL provided"));

  const storedEthRpcLogs$ = combineLatest([startBlock$, latestBlockNumber$]).pipe(
    map(([startBlock, endBlock]) => ({ startBlock, endBlock })),
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
        logFilter,
        storageAdapter,
      });

      return from(storedBlocks);
    }),
  );

  const storedBlock$ = storedPendingLogs$.pipe(
    catchError((e) => {
      debug("failed to stream logs from pending log RPC:", e.message);
      debug("falling back to streaming logs from indexer");
      return storedIndexerLogs$;
    }),
    catchError((e) => {
      debug("failed to stream logs from indexer:", e.message);
      debug("falling back to streaming logs from ETH RPC");
      return storedEthRpcLogs$;
    }),
    tap(async ({ logs, blockNumber }) => {
      debug("stored", logs.length, "logs for block", blockNumber);
      lastBlockNumberProcessed = blockNumber;

      if (!caughtUp && startBlock != null && latestBlockNumber != null) {
        if (lastBlockNumberProcessed < latestBlockNumber) {
          const totalBlocks = latestBlockNumber - startBlock;
          const processedBlocks = lastBlockNumberProcessed - startBlock;
          onProgress?.({
            step: SyncStep.RPC,
            percentage: Number((processedBlocks * 1000n) / totalBlocks) / 10,
            latestBlockNumber,
            lastBlockNumberProcessed,
            message: "Hydrating from RPC",
          });
        } else {
          caughtUp = true;
          onProgress?.({
            step: SyncStep.LIVE,
            percentage: 100,
            latestBlockNumber,
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
