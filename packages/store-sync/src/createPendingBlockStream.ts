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
  startWith,
  merge,
  filter,
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
import { GetRpcClientOptions } from "@latticexyz/block-logs-stream";
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
  console.log("creating pending block stream", opts);
  const recreateStream$ = new Subject<void>();

  const latestBlock$ = createLatestBlockStream(opts);

  const seenBlockLogs: { [blockNumber: string]: { [logIndex: number]: boolean } } = {};

  let restartBlockNumber = opts.fromBlock;
  const pendingLogs$ = recreateStream$.pipe(
    startWith(restartBlockNumber),
    switchMap(() =>
      watchLogs({
        ...opts,
        url: opts.pendingLogsUrl,
        fromBlock: restartBlockNumber,
      }).logs$.pipe(
        catchError((error) => {
          debug("Error in pending logs stream:", error);
          recreateStream$.next();
          // TODO: do we need to throw here?
          return throwError(() => error);
        }),
      ),
    ),
    tap((block) => {
      debug("[createPendingBlockStream] new pending logs", block);
      restartBlockNumber = block.blockNumber;
    }),
  );

  const missingLogs$ = latestBlock$.pipe(
    map((block) => {
      const blockNumber = String(block.blockNumber);
      const seenLogs = seenBlockLogs[blockNumber] ?? {};
      const missingLogs = block.logs.filter((log) => !seenLogs[log.logIndex!]);
      delete seenBlockLogs[blockNumber];
      return { blockNumber: block.blockNumber, logs: missingLogs };
    }),
    tap(({ blockNumber, logs }) => {
      debug("[createPendingBlockStream] latest block", blockNumber, logs);
      restartBlockNumber = blockNumber + 1n;
    }),
    filter(({ logs }) => logs.length > 0),
    tap(({ blockNumber, logs }) => {
      debug("[createPendingBlockStream] missing logs", blockNumber, logs);
      recreateStream$.next();
    }),
  );

  return merge(pendingLogs$, missingLogs$);
}

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
  console.log("creating latest block stream", opts);
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
