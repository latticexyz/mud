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
  timer,
} from "rxjs";
import { StorageAdapterBlock, StoreEventsLog, SyncFilter } from "./common";
import { watchLogs } from "./watchLogs";
import { Hex } from "viem";
import { fromEventSource } from "./fromEventSource";
import { isLogsApiResponse } from "./indexer-client/isLogsApiResponse";
import { toStorageAdapterBlock } from "./indexer-client/toStorageAdapterBlock";
import { fetchAndStoreLogs } from "./fetchAndStoreLogs";
import { storeEventsAbi } from "@latticexyz/store";
import { bigIntMax, groupBy, isDefined } from "@latticexyz/common/utils";
import { getRpcClient, GetRpcClientOptions } from "@latticexyz/block-logs-stream";
import { debug as parentDebug } from "./debug";

const debug = parentDebug.extend("createPreconfirmedBlockStream");

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

  const latestBlock$ = recreateLatestStream$.pipe(
    startWith(undefined),
    tap(() => {
      debug("initializing latest block stream");
      initialCatchUpBlockNumber = undefined;
      getRpcClient(opts)
        .request({ method: "eth_blockNumber" })
        .then((blockNumber) => {
          debug("initial catch up block number", BigInt(blockNumber));
          initialCatchUpBlockNumber = BigInt(blockNumber);
        });
    }),
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

  let preconfirmedTransactionLogs: { [txHash: string]: Partial<StoreEventsLog>[] | undefined } = {};
  let preconfirmedLogsState: "initializing" | "initialized" | "waiting" = "waiting";
  let firstPreconfirmedBlockNumber: bigint | undefined = undefined;
  let attempt = 0;
  const preconfirmedBlockLogs$ = recreatePreconfirmedStream$.pipe(
    tap(() => {
      if (attempt !== 0) debug(`waiting ${attempt * 500}ms before initializing preconfirmed logs stream`);
      preconfirmedLogsState = "initializing";
      firstPreconfirmedBlockNumber = undefined;
      preconfirmedTransactionLogs = {};
    }),
    switchMap(() => timer(attempt * 500)),
    tap(() => {
      debug(`initializing preconfirmed logs stream`);
      attempt++;
    }),
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
      if (initialCatchUpBlockNumber == null || block.blockNumber <= initialCatchUpBlockNumber) {
        debug(
          "skipping preconfirmed block",
          block.blockNumber,
          "before initial catch up block",
          initialCatchUpBlockNumber,
        );
        return false;
      }
      const isProcessedBlock = block.blockNumber <= processedLatestBlockNumber;
      if (isProcessedBlock) debug("skipping already processed block in preconfirmed stream", block.blockNumber);
      return !isProcessedBlock;
    }),
    tap((block) => {
      if (preconfirmedLogsState !== "initialized") {
        firstPreconfirmedBlockNumber = block.blockNumber;
        debug("first preconfirmed block number", firstPreconfirmedBlockNumber);
      }
      debug("preconfirmed block", block.blockNumber, "with", block.logs.length, "logs");
      preconfirmedLogsState = "initialized";
      attempt = 0;
      block.logs.forEach((log) => {
        const txHash = log.transactionHash;
        if (txHash == null) {
          debug("unexpected null transaction hash", log);
          return;
        }
        (preconfirmedTransactionLogs[txHash] ??= []).push(log);
      });
    }),
  );

  const latestBlockLogs$ = latestBlock$.pipe(
    map((block) => {
      processedLatestBlockNumber = block.blockNumber;

      const mismatchingTransactions: string[] = [];
      const confirmPreconfirmedLogs =
        preconfirmedLogsState === "initialized" &&
        firstPreconfirmedBlockNumber &&
        block.blockNumber >= firstPreconfirmedBlockNumber;

      if (confirmPreconfirmedLogs) {
        const logsByTransaction = groupBy(
          block.logs.filter((log) => log.transactionHash) as StoreEventsLog[],
          (log) => log.transactionHash,
        );
        for (const [txHash, latestLogs] of logsByTransaction.entries()) {
          const preconfirmedLogs = preconfirmedTransactionLogs[txHash];
          delete preconfirmedTransactionLogs[txHash];

          if (!preconfirmedLogs || preconfirmedLogs.length !== latestLogs.length) {
            debug(
              "found mismatching transaction",
              JSON.stringify(
                {
                  txHash,
                  numPreconfirmedLogs: preconfirmedLogs?.length ?? "none",
                  numLatestLogs: latestLogs.length,
                  missingLogs: latestLogs.filter(
                    (log) => !preconfirmedLogs?.find((preconfirmedLog) => log.logIndex === preconfirmedLog.logIndex),
                  ),
                },
                (_, value) => (typeof value === "bigint" ? value.toString() : value),
                2,
              ),
            );
            mismatchingTransactions.push(txHash);
          }
        }
      }

      debug(
        "got latest block",
        block.blockNumber,
        "with",
        block.logs.length,
        "logs",
        preconfirmedLogsState === "initialized"
          ? `(${
              mismatchingTransactions.length ? mismatchingTransactions.length + " txs mismatching" : "all preconfirmed"
            })`
          : "",
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
      if (!confirmPreconfirmedLogs) {
        debug("block is before first preconfirmed block, not recreating preconfirmed stream");
        return block;
      }

      // If the preconfirmed logs stream is initialized but there are mismatching logs, recreate it and pass the block through.
      // Pass all logs from this block, not just the mismatching ones, to make sure they appear in the right order.
      if (mismatchingTransactions.length > 0) {
        debug("mismatching transactions found in latest block", block.blockNumber, "recreating preconfirmed stream");
        recreatePreconfirmedStream$.next();
        return block;
      }

      debug(
        "no mismatching transactions found in latest block",
        block.blockNumber,
        "not recreating preconfirmed stream",
      );
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
