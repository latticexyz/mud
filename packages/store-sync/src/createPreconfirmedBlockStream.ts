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
  delay,
} from "rxjs";
import { StorageAdapterBlock, StoreEventsLog, SyncFilter } from "./common";
import { watchLogs } from "./watchLogs";
import { Hex } from "viem";
import { fromEventSource } from "./fromEventSource";
import { isLogsApiResponse } from "./indexer-client/isLogsApiResponse";
import { toStorageAdapterBlock } from "./indexer-client/toStorageAdapterBlock";
import { fetchAndStoreLogs } from "./fetchAndStoreLogs";
import { storeEventsAbi } from "@latticexyz/store";
import { bigIntMax, isDefined } from "@latticexyz/common/utils";
import { getRpcClient, GetRpcClientOptions } from "@latticexyz/block-logs-stream";
import { debug as parentDebug } from "./debug";

const debug = parentDebug.extend("preconfirmedStream");

type PreconfirmedBlockStreamOptions = GetRpcClientOptions & {
  fromBlock: bigint;
  preconfirmedLogsUrl: string;
  indexerUrl?: string;
  chainId: number;
  address?: Hex;
  filters: SyncFilter[];
  latestBlockNumber$: Observable<bigint>;
  maxBlockRange?: bigint;
};

export function createPreconfirmedBlockStream(opts: PreconfirmedBlockStreamOptions): Observable<StorageAdapterBlock> {
  const recreatePreconfirmedStream$ = new Subject<void>();
  const recreateLatestStream$ = new Subject<void>();

  let processedLatestBlockNumber = opts.fromBlock - 1n;
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
      createLatestBlockStream({ ...opts, fromBlock: processedLatestBlockNumber + 1n }).pipe(
        catchError((e) => {
          debug("Error in latest block stream, recreating", e);
          recreateLatestStream$.next();
          return throwError(() => e);
        }),
      ),
    ),
  );

  let processedBlockLogs: { [blockNumber: string]: { [logIndex: number]: boolean } } = {};
  let preconfirmedLogsState: "initializing" | "initialized" | "waiting" = "waiting";
  let attempt = 0;
  const preconfirmedBlockLogs$ = recreatePreconfirmedStream$.pipe(
    tap(() => {
      debug(`initializing preconfirmed logs stream in ${attempt * 500}ms`);
      preconfirmedLogsState = "initializing";
      processedBlockLogs = {};
    }),
    delay(attempt * 500),
    tap(() => attempt++),
    switchMap(() =>
      watchLogs({
        ...opts,
        url: opts.preconfirmedLogsUrl,
        fromBlock: processedLatestBlockNumber + 1n,
      }).logs$.pipe(
        catchError((e) => {
          debug("Error in preconfirmed logs stream, recreating", e);
          recreatePreconfirmedStream$.next();
          return of(null);
        }),
      ),
    ),
    filter((block): block is StorageAdapterBlock => block != null),
    filter((block) => {
      const isProcessedBlock = block.blockNumber <= processedLatestBlockNumber;
      if (isProcessedBlock) debug("skipping already processed block in preconfirmed stream", block.blockNumber);
      return !isProcessedBlock;
    }),
    tap((block) => {
      debug(
        "preconfirmed block",
        block.blockNumber,
        "with",
        block.logs.length,
        "logs",
        block.logs.map((log) => {
          return { logIndex: log.logIndex, txIndex: log.transactionIndex };
        }),
      );
      preconfirmedLogsState = "initialized";
      attempt = 0;
      const seenLogs = (processedBlockLogs[String(block.blockNumber)] ??= {});
      block.logs.forEach((log) => {
        seenLogs[log.logIndex!] = true;
      });
    }),
  );

  const latestBlockLogs$ = latestBlock$.pipe(
    map((block) => {
      const missingBlock = processedBlockLogs[String(block.blockNumber)] == null;
      const seenLogs = processedBlockLogs[String(block.blockNumber)] ?? {};
      const missingLogs = block.logs.filter((log) => !seenLogs[log.logIndex!]);
      delete processedBlockLogs[String(block.blockNumber)];
      processedLatestBlockNumber = block.blockNumber;

      debug(
        "got latest block",
        block.blockNumber,
        "with",
        block.logs.length,
        "logs (",
        missingBlock ? "missing block," : "block seen,",
        `${missingLogs.length} new logs`,
        ")",
      );

      if (preconfirmedLogsState === "waiting") {
        // Once the initial catch up block is reached, we can start the preconfirmed logs stream
        if (
          initialCatchUpBlockNumber != null && // initial catch up block fetched
          block.blockNumber >= initialCatchUpBlockNumber // initial catch up block reached
        ) {
          debug("initial catch up block number", initialCatchUpBlockNumber, "reached, creating preconfirmed stream");
          recreatePreconfirmedStream$.next();
        }
        // While the preconfirmed logs stream is waiting, pass the block through
        return block;
      }

      // While the preconfirmed logs stream is initializing, don't recreate it and pass the block through
      if (preconfirmedLogsState === "initializing") {
        debug("preconfirmed logs stream is initializing, not recreating");
        return block;
      }

      // If the preconfirmed logs stream is initialized but there are missing logs, recreate it and pass the block through.
      // Pass all logs from this block, not just the missing ones, to make sure they appear in the right order.
      if (preconfirmedLogsState === "initialized" && (missingLogs.length > 0 || missingBlock)) {
        debug("missing logs found in latest block", block.blockNumber, "recreating preconfirmed stream", {
          missingLogs: missingLogs.map((log) => {
            return { logIndex: log.logIndex, txIndex: log.transactionIndex };
          }),
          missingBlock,
        });
        recreatePreconfirmedStream$.next();
        return block;
      }

      debug("no missing logs found in latest block", block.blockNumber, "not recreating preconfirmed stream");
      return;
    }),
    filter(isDefined),
  );

  return merge(preconfirmedBlockLogs$, latestBlockLogs$);
}

// TODO: refactor to reduce duplication with indexer/rpc stream in `createStoreSync.ts`
function createLatestBlockStream({
  fromBlock,
  indexerUrl,
  chainId,
  address,
  filters,
  latestBlockNumber$,
  maxBlockRange,
  ...opts
}: PreconfirmedBlockStreamOptions): Observable<StorageAdapterBlock> {
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
