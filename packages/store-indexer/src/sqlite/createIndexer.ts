import { Chain, PublicClient, Transport } from "viem";
import {
  createBlockStream,
  isNonPendingBlock,
  blockRangeToLogs,
  groupLogsByBlockNumber,
} from "@latticexyz/block-logs-stream";
import { concatMap, filter, from, map, mergeMap, tap } from "rxjs";
import { storeEventsAbi } from "@latticexyz/store";
import { blockLogsToStorage } from "@latticexyz/store-sync";
import { sqliteStorage } from "@latticexyz/store-sync/sqlite";
import { BaseSQLiteDatabase } from "drizzle-orm/sqlite-core";
import { debug } from "../debug";

type CreateIndexerOptions = {
  database: BaseSQLiteDatabase<"sync", any>;
  publicClient: PublicClient<Transport, Chain>;
  startBlock: bigint;
  maxBlockRange: bigint;
};

export function createIndexer({ database, publicClient, startBlock, maxBlockRange }: CreateIndexerOptions): void {
  const latestBlock$ = createBlockStream({ publicClient, blockTag: "latest" });

  const latestBlockNumber$ = latestBlock$.pipe(
    filter(isNonPendingBlock),
    map((block) => block.number)
  );

  const blockLogs$ = latestBlockNumber$.pipe(
    tap((latestBlockNumber) => debug("latest block number", latestBlockNumber)),
    map((latestBlockNumber) => ({ startBlock, endBlock: latestBlockNumber })),
    blockRangeToLogs({
      publicClient,
      events: storeEventsAbi,
      maxBlockRange,
    }),
    tap(({ fromBlock, toBlock, logs }) => {
      debug("found", logs.length, "logs for block", fromBlock, "-", toBlock);
    }),
    mergeMap(({ toBlock, logs }) => from(groupLogsByBlockNumber(logs, toBlock)))
  );

  blockLogs$
    .pipe(
      concatMap(blockLogsToStorage(sqliteStorage({ database, publicClient }))),
      tap(({ blockNumber, operations }) => {
        debug("stored", operations.length, "operations for block", blockNumber);
      })
    )
    .subscribe();
}
