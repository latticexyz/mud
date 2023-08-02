import { Hex, TransactionReceipt } from "viem";
import {
  createBlockStream,
  isNonPendingBlock,
  blockRangeToLogs,
  groupLogsByBlockNumber,
} from "@latticexyz/block-logs-stream";
import { concatMap, filter, firstValueFrom, from, map, mergeMap, share, tap } from "rxjs";
import { StoreConfig, storeEventsAbi } from "@latticexyz/store";
import { BaseSQLiteDatabase } from "drizzle-orm/sqlite-core";
import { debug } from "../debug";
import { SyncOptions, SyncResult } from "../common";
import { blockLogsToStorage } from "../blockLogsToStorage";
import { sqliteStorage } from "./sqliteStorage";

type SyncToSqliteOptions<TConfig extends StoreConfig = StoreConfig> = SyncOptions<TConfig> & {
  /**
   * [SQLite database object from Drizzle][0].
   *
   * [0]: https://orm.drizzle.team/docs/installation-and-db-connection/sqlite/better-sqlite3
   */
  database: BaseSQLiteDatabase<"sync", any>;
};

type SyncToSqliteResult<TConfig extends StoreConfig = StoreConfig> = SyncResult<TConfig>;

/**
 * Creates an indexer to process and store blockchain events.
 *
 * @param {CreateIndexerOptions} options See `CreateIndexerOptions`.
 * @returns A function to unsubscribe from the block stream, effectively stopping the indexer.
 */
export function syncToSqlite<TConfig extends StoreConfig = StoreConfig>({
  database,
  publicClient,
  address,
  startBlock = 0n,
  maxBlockRange,
  indexerUrl,
  initialState,
}: SyncToSqliteOptions<TConfig>): SyncToSqliteResult<TConfig> {
  // TODO: sync initial state

  const latestBlock$ = createBlockStream({ publicClient, blockTag: "latest" }).pipe(share());

  const latestBlockNumber$ = latestBlock$.pipe(
    filter(isNonPendingBlock),
    map((block) => block.number),
    share()
  );

  let latestBlockNumber: bigint | null = null;
  const blockLogs$ = latestBlockNumber$.pipe(
    tap((blockNumber) => {
      debug("latest block number", blockNumber);
      latestBlockNumber = blockNumber;
    }),
    map((blockNumber) => ({ startBlock, endBlock: blockNumber })),
    blockRangeToLogs({
      publicClient,
      address,
      events: storeEventsAbi,
      maxBlockRange,
    }),
    tap(({ fromBlock, toBlock, logs }) => {
      debug("found", logs.length, "logs for block", fromBlock, "-", toBlock);
    }),
    mergeMap(({ toBlock, logs }) => from(groupLogsByBlockNumber(logs, toBlock))),
    share()
  );

  let lastBlockNumberProcessed: bigint | null = null;
  const blockStorageOperations$ = blockLogs$.pipe(
    concatMap(blockLogsToStorage(sqliteStorage({ database, publicClient }))),
    tap(({ blockNumber, operations }) => {
      debug("stored", operations.length, "operations for block", blockNumber);
      lastBlockNumberProcessed = blockNumber;

      // TODO: store some notion of sync progress?
    }),
    share()
  );

  // Start the sync
  const sub = blockStorageOperations$.subscribe();

  async function waitForTransaction(tx: Hex): Promise<{
    receipt: TransactionReceipt;
  }> {
    // Wait for tx to be mined
    const receipt = await publicClient.waitForTransactionReceipt({ hash: tx });

    // If we haven't processed a block yet or we haven't processed the block for the tx, wait for it
    if (lastBlockNumberProcessed == null || lastBlockNumberProcessed < receipt.blockNumber) {
      await firstValueFrom(
        blockStorageOperations$.pipe(
          filter(({ blockNumber }) => blockNumber != null && blockNumber >= receipt.blockNumber)
        )
      );
    }

    return { receipt };
  }

  return {
    latestBlock$,
    latestBlockNumber$,
    blockLogs$,
    blockStorageOperations$,
    waitForTransaction,
    destroy: (): void => {
      sub.unsubscribe();
    },
  };
}
