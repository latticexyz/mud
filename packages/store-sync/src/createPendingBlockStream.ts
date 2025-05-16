import {
  catchError,
  combineLatest,
  concatMap,
  from,
  map,
  mergeMap,
  Observable,
  of,
  Subject,
  tap,
  throwError,
  switchMap,
  merge,
  filter,
  startWith,
} from "rxjs";
import { StorageAdapterBlock, StoreEventsLog, SyncFilter } from "./common";
import { watchLogs } from "./watchLogs";
import { Hex } from "viem";
import { fromEventSource } from "./fromEventSource";
import { isLogsApiResponse } from "./indexer-client/isLogsApiResponse";
import { toStorageAdapterBlock } from "./indexer-client/toStorageAdapterBlock";
import { fetchAndStoreLogs } from "./fetchAndStoreLogs";
import { storeEventsAbi } from "@latticexyz/store";
import { bigIntMax } from "@latticexyz/common/utils";
import { getRpcClient, GetRpcClientOptions } from "@latticexyz/block-logs-stream";
import { debug } from "./debug";

type PendingBlockStreamOptions = GetRpcClientOptions & {
  fromBlock: bigint;
  pendingLogsUrl: string;
  indexerUrl?: string;
  chainId: number;
  address?: Hex;
  filters: SyncFilter[];
  latestBlockNumber$: Observable<bigint>;
  maxBlockRange?: bigint;
};

export function createPendingBlockStream(opts: PendingBlockStreamOptions): Observable<StorageAdapterBlock> {
  const recreatePendingStream$ = new Subject<void>();
  const recreateLatestStream$ = new Subject<void>();

  let restartBlockNumber = opts.fromBlock;
  let initialCatchUpBlockNumber: bigint | undefined = undefined;
  getRpcClient(opts)
    .request({ method: "eth_blockNumber" })
    .then((blockNumber) => {
      console.log("initial catch up block number", BigInt(blockNumber));
      initialCatchUpBlockNumber = BigInt(blockNumber);
    });

  const latestBlock$ = recreateLatestStream$.pipe(
    startWith(undefined),
    switchMap(() =>
      createLatestBlockStream({ ...opts, fromBlock: restartBlockNumber }).pipe(
        catchError((e) => {
          debug("Error in latest block stream, recreating", e);
          recreateLatestStream$.next();
          return throwError(() => e);
        }),
      ),
    ),
  );

  let processedBlockLogs: { [blockNumber: string]: { [logIndex: number]: boolean } } = {};
  let pendingLogsState: "initializing" | "initialized" | "waiting" = "waiting";
  const pendingLogs$ = recreatePendingStream$.pipe(
    tap(() => {
      debug("initializing pending logs stream");
      pendingLogsState = "initializing";
      processedBlockLogs = {};
    }),
    switchMap(() =>
      watchLogs({
        ...opts,
        url: opts.pendingLogsUrl,
        fromBlock: restartBlockNumber,
      }).logs$.pipe(
        catchError((e) => {
          debug("Error in pending logs stream, recreating", e);
          recreatePendingStream$.next();
          return throwError(() => e);
        }),
      ),
    ),
    tap((block) => {
      debug("pending logs stream initialized");
      pendingLogsState = "initialized";
      restartBlockNumber = block.blockNumber;
      const seenLogs = (processedBlockLogs[String(block.blockNumber)] ??= {});
      block.logs.forEach((log) => {
        seenLogs[log.logIndex!] = true;
      });
      debug("got pending block", block.blockNumber, "with", block.logs.length, "logs");
    }),
  );

  const missingLogs$ = latestBlock$.pipe(
    map((block) => {
      const seenLogs = processedBlockLogs[String(block.blockNumber)] ?? {};
      const missingLogs = block.logs.filter((log) => !seenLogs[log.logIndex!]);
      debug(
        "got latest block",
        block.blockNumber,
        "with",
        block.logs.length,
        "logs (",
        missingLogs.length,
        "new logs)",
      );
      return { blockNumber: block.blockNumber, logs: missingLogs };
    }),
    tap(({ blockNumber }) => {
      delete processedBlockLogs[String(blockNumber)];
      restartBlockNumber = blockNumber + 1n;
      if (
        pendingLogsState === "waiting" && // pending logs stream not initialized yet
        initialCatchUpBlockNumber != null && // initial catch up block fetched
        blockNumber >= initialCatchUpBlockNumber // initial catch up block reached
      ) {
        debug("initial catch up block number reached, creating pending stream");
        recreatePendingStream$.next();
        return;
      }
    }),
    filter(({ logs }) => logs.length > 0),
    tap(({ blockNumber }) => {
      if (pendingLogsState === "initializing") {
        debug("pending logs stream is initializing, not recreating");
        return;
      }
      if (pendingLogsState === "initialized") {
        debug("missing logs found in latest block", blockNumber, "recreating pending stream");
        recreatePendingStream$.next();
        return;
      }
      debug("catching up, pending logs stream not initialized yet");
    }),
  );

  return merge(pendingLogs$, missingLogs$);
}

// TODO: reduce duplication with indexer/rpc stream in `createStoreSync.ts`
function createLatestBlockStream({
  fromBlock,
  indexerUrl,
  chainId,
  address,
  filters,
  latestBlockNumber$,
  maxBlockRange,
  ...opts
}: PendingBlockStreamOptions): Observable<StorageAdapterBlock> {
  const indexerBlocks$ = indexerUrl
    ? of(indexerUrl).pipe(
        mergeMap((indexerUrl) => {
          const url = new URL(
            `api/logs-live?${new URLSearchParams({
              input: JSON.stringify({ chainId, address, filters }),
              block_num: fromBlock.toString(),
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
      )
    : throwError(() => new Error("No indexer URL provided"));

  let lastBlockNumberProcessed = 0n;
  const ethRpcBlocks$ = combineLatest([of(fromBlock), latestBlockNumber$]).pipe(
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
        logFilter: filters.length
          ? (log: StoreEventsLog): boolean =>
              filters.some(
                (filter) =>
                  filter.tableId === log.args.tableId &&
                  (filter.key0 == null || filter.key0 === log.args.keyTuple[0]) &&
                  (filter.key1 == null || filter.key1 === log.args.keyTuple[1]),
              )
          : undefined,
        storageAdapter: () => Promise.resolve(),
      });
      return from(storedBlocks);
    }),
    tap((block) => {
      lastBlockNumberProcessed = block.blockNumber;
    }),
  );

  const latestBlock$ = indexerBlocks$.pipe(
    catchError((error) => {
      debug("failed to stream logs from indexer:", error.message);
      debug("falling back to streaming logs from ETH RPC");
      return ethRpcBlocks$;
    }),
  );

  return latestBlock$;
}
