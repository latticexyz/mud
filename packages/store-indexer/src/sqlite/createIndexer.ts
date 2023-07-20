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

type CreateIndexerOptions = {
  database: BaseSQLiteDatabase<"sync", void>;
  publicClient: PublicClient<Transport, Chain>;
  startBlock: bigint;
  maxBlockRange: bigint;
};

export function createIndexer({ database, publicClient, startBlock, maxBlockRange }: CreateIndexerOptions): void {
  // TODO: fetch latest block from database and update `startBlock`

  const latestBlock$ = createBlockStream({ publicClient, blockTag: "latest" });

  const latestBlockNumber$ = latestBlock$.pipe(
    filter(isNonPendingBlock),
    map((block) => block.number)
  );

  const blockLogs$ = latestBlockNumber$.pipe(
    tap((latestBlockNumber) => console.log("latest block number", latestBlockNumber)),
    map((latestBlockNumber) => ({ startBlock, endBlock: latestBlockNumber })),
    blockRangeToLogs({
      publicClient,
      events: storeEventsAbi,
      maxBlockRange,
    }),
    tap(({ fromBlock, toBlock, logs }) => {
      console.log("found", logs.length, "logs for block", fromBlock, "-", toBlock);
      logs.forEach((log) => {
        // console.log("table", log.blockNumber, TableId.fromHex(log.args.table));
      });
    }),
    mergeMap(({ toBlock, logs }) => from(groupLogsByBlockNumber(logs, toBlock)))
    // tap((blockLogs) => console.log("block logs", blockLogs))
  );

  blockLogs$
    .pipe(
      concatMap(blockLogsToStorage(sqliteStorage({ database, publicClient }))),
      tap(({ blockNumber, operations }) => {
        console.log("stored", operations.length, "operations for block", blockNumber);
      })
    )
    .subscribe();
}
