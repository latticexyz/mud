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
  /**
   * [SQLite database object from Drizzle][0].
   *
   * [0]: https://orm.drizzle.team/docs/installation-and-db-connection/sqlite/better-sqlite3
   */
  database: BaseSQLiteDatabase<"sync", any>;
  /**
   * [viem `PublicClient`][0] used for fetching logs from the RPC.
   *
   * [0]: https://viem.sh/docs/clients/public.html
   */
  publicClient: PublicClient<Transport, Chain>;
  /**
   * Optional block number to start indexing from. Useful for resuming the indexer from a particular point in time or starting after a particular contract deployment.
   */
  startBlock?: bigint;
  /**
   * Optional maximum block range, if your RPC limits the amount of blocks fetched at a time.
   */
  maxBlockRange?: bigint;
};

/**
 * Creates an indexer to process and store blockchain events.
 *
 * @param {CreateIndexerOptions} options See `CreateIndexerOptions`.
 * @returns A function to unsubscribe from the block stream, effectively stopping the indexer.
 */
export function createIndexer({
  database,
  publicClient,
  startBlock = 0n,
  maxBlockRange,
}: CreateIndexerOptions): () => void {
  const latestBlock$ = createBlockStream({ publicClient, blockTag: "latest" });

  const latestBlockNumber$ = latestBlock$.pipe(
    filter(isNonPendingBlock),
    map((block) => block.number)
  );

  let latestBlockNumber: bigint | null = null;
  const blockLogs$ = latestBlockNumber$.pipe(
    tap((blockNumber) => {
      latestBlockNumber = blockNumber;
      debug("latest block number", blockNumber);
    }),
    map((blockNumber) => ({ startBlock, endBlock: blockNumber })),
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

  let latestBlockNumberProcessed: bigint | null = null;
  const sub = blockLogs$
    .pipe(
      concatMap(blockLogsToStorage(sqliteStorage({ database, publicClient }))),
      tap(({ blockNumber, operations }) => {
        latestBlockNumberProcessed = blockNumber;
        debug("stored", operations.length, "operations for block", blockNumber);
        if (latestBlockNumber === latestBlockNumberProcessed) {
          debug("all caught up");
        }
      })
    )
    .subscribe();

  return () => {
    sub.unsubscribe();
  };
}
