import { MUDChain } from "@latticexyz/common/chains";
import { storeEventsAbi } from "@latticexyz/store";
import { GetTransactionReceiptErrorType, Hex, parseEventLogs } from "viem";
import { entryPoint07Abi } from "viem/account-abstraction";
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
import { createBlockStream, getRpcClient } from "@latticexyz/block-logs-stream";
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
  mergeWith,
  ignoreElements,
  switchMap,
  ReplaySubject,
  timer,
  retry,
} from "rxjs";
import { debug as parentDebug } from "./debug";
import { SyncStep } from "./SyncStep";
import { bigIntMax, chunk, isDefined, waitForIdle } from "@latticexyz/common/utils";
import { getSnapshot } from "./getSnapshot";
import { fromEventSource } from "./fromEventSource";
import { fetchAndStoreLogs } from "./fetchAndStoreLogs";
import { isLogsApiResponse } from "./indexer-client/isLogsApiResponse";
import { toStorageAdapterBlock } from "./indexer-client/toStorageAdapterBlock";
import { getAction } from "viem/utils";
import { getChainId, getTransactionReceipt } from "viem/actions";
import packageJson from "../package.json";
import { createPreconfirmedBlockStream } from "./createPreconfirmedBlockStream";

/**
 * High level approach to syncing state with `createStoreSync`
 *
 * If preconfirmed logs are not available:
 * - Initialize snapshot
 * - Initialize log stream from latest block
 *   - Catch up logs between snapshot and latest block
 *   - Attempt to stream logs from indexer
 *   - On failure, fallback to streaming logs from RPC
 * - Release initial, catchup and ongoing stream to subscribers
 *
 * If preconfirmed logs are available:
 * - Initialize from snapshot
 * - Open a preconfirmed log stream
 *   - On error recreate the stream
 * - Open a fallback log stream (indexer or RPC)
 * - Catch up logs between snapshot and latest block
 * - Cache processed log indices from preconfirmed logs stream
 * - On every new block from the fallback logs stream
 *   - Verify that all logs have already been processed in the preconfirmed logs stream
 *   - If missing logs are found, pass the block with missing logs to subscribers and reconnect the preconfirmed logs stream
 */

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
  address,
  filters: initialFilters = [],
  tableIds = [],
  followBlockTag = "latest",
  startBlock: initialStartBlock = 0n,
  maxBlockRange,
  initialState,
  initialBlockLogs,
  enableHydrationChunking = true,
  ...opts
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

  const publicClient = getRpcClient(opts);
  const indexerUrl = ((): string | undefined => {
    if (opts.indexerUrl === false) return;
    if (opts.indexerUrl) return opts.indexerUrl;
    if (publicClient.chain) return (publicClient.chain as MUDChain).indexerUrl;
  })();

  const chainId = publicClient.chain?.id ?? (await getAction(publicClient, getChainId, "getChainId")({}));

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

      if (enableHydrationChunking) {
        // Split snapshot operations into chunks so we can update the progress callback (and ultimately render visual progress for the user).
        // This isn't ideal if we want to e.g. batch load these into a DB in a single DB tx, but we'll take it.
        //
        // Split into 50 equal chunks (for better `onProgress` updates) but only if we have 100+ items per chunk
        const chunkSize = Math.max(100, Math.floor(logs.length / 50));
        const chunks = Array.from(chunk(logs, chunkSize));
        for (const [i, chunk] of chunks.entries()) {
          debug(`hydrating chunk ${i}/${chunks.length}`);
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
      } else {
        debug("hydrating all logs without chunking");
        await storageAdapter({ blockNumber, logs });
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
    }),
  );

  let latestBlockNumber: bigint | null = null;

  const latestBlock$ = defer(() => {
    debug("creating block stream");
    return createBlockStream({ ...opts, blockTag: followBlockTag });
  }).pipe(
    // TODO: detect network online and reset this
    retry({
      delay: (error, retryCount) => {
        const backoff = Math.min(4_000, 2 ** retryCount * 50);
        return timer(backoff);
      },
      resetOnSuccess: true,
    }),
    share({
      connector: () => new ReplaySubject(1),
      resetOnError: true,
      resetOnComplete: false,
      resetOnRefCountZero: true,
    }),
  );

  const latestBlockNumber$ = latestBlock$.pipe(
    map((block) => block.number),
    tap((blockNumber) => {
      latestBlockNumber = blockNumber;
      debug("on block number", blockNumber, "for", followBlockTag, "block tag");
    }),
    shareReplay(1),
  );

  let lastBlockNumberProcessed: bigint | null = null;
  let caughtUp = false;

  const preconfirmedLogsWebSocketUrl = publicClient.chain?.rpcUrls?.wiresaw?.webSocket?.[0];
  const storedPreconfirmedLogs$ = preconfirmedLogsWebSocketUrl
    ? startBlock$.pipe(
        switchMap((startBlock) =>
          createPreconfirmedBlockStream({
            ...opts,
            fromBlock: startBlock,
            preconfirmedLogsUrl: preconfirmedLogsWebSocketUrl,
            chainId,
            filters,
            address,
            latestBlockNumber$,
            indexerUrl,
          }),
        ),
        concatMap(async (block) => {
          await storageAdapter(block);
          return block;
        }),
      )
    : throwError(() => new Error("No preconfirmed logs WebSocket RPC URL provided"));

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
          return toStorageAdapterBlock(data);
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
        ...opts,
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

  const storedBlock$ = storedPreconfirmedLogs$.pipe(
    catchError((error) => {
      debug("failed to stream logs from preconfirmed log RPC:", error.message);
      debug("falling back to streaming logs from indexer");
      return storedIndexerLogs$;
    }),
    catchError((error) => {
      debug("failed to stream logs from indexer:", error.message);
      debug("falling back to streaming logs from ETH RPC");
      return storedEthRpcLogs$;
    }),
    // subscribe to `latestBlockNumber$` so the sync progress is updated
    // but don't merge/emit anything
    mergeWith(latestBlockNumber$.pipe(ignoreElements())),
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
  const recentStoredBlocks$ = storedBlockLogs$.pipe(
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
    const hasTransaction$ = recentStoredBlocks$.pipe(
      // We use `mergeMap` instead of `concatMap` here to send the fetch request immediately when a new block range appears,
      // instead of sending the next request only when the previous one completed.
      mergeMap(async (storedBlocks) => {
        for (const storedBlock of storedBlocks) {
          // If stored block had Store event logs associated with tx, it must have succeeded.
          if (storedBlock.logs.some((log) => log.transactionHash === tx)) {
            return { blockNumber: storedBlock.blockNumber, status: "success", transactionHash: tx } as const;
          }
        }

        try {
          const lastStoredBlock = storedBlocks[0];
          debug("fetching tx receipt for block", lastStoredBlock.blockNumber);
          const receipt = await getAction(publicClient, getTransactionReceipt, "getTransactionReceipt")({ hash: tx });

          // Skip if sync hasn't caught up to this transaction's block.
          if (lastStoredBlock.blockNumber < receipt.blockNumber) return;

          // Check if this was a user op so we can get the internal user op status.
          const userOpEvents = parseEventLogs({
            logs: receipt.logs,
            abi: entryPoint07Abi,
            eventName: "UserOperationEvent" as const,
          });
          if (userOpEvents.length) {
            debug("tx receipt appears to be a user op, using user op status instead");
            if (userOpEvents.length > 1) {
              const issueLink = `https://github.com/latticexyz/mud/issues/new${new URLSearchParams({
                title: "waitForTransaction found more than one user op",
                body: `MUD version: ${packageJson.version}\nChain ID: ${chainId}\nTransaction: ${tx}\n`,
              })}`;
              console.warn(
                // eslint-disable-next-line max-len
                `Receipt for transaction ${tx} had more than one \`UserOperationEvent\`. This may have unexpected behavior.\n\nIf you encounter this, please open an issue:\n${issueLink}`,
              );
            }

            return {
              status: userOpEvents[0].args.success ? "success" : "reverted",
              blockNumber: receipt.blockNumber,
              transactionHash: receipt.transactionHash,
            } as const;
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
