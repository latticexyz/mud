import { DozerLogFilter, DozerSyncFilter, DozerTableQuery } from "./common";
import { Hex } from "viem";
import { StorageAdapterBlock, SyncFilter } from "../common";
import { fetchRecordsDozerSql } from "./fetchRecordsDozerSql";
import { recordToLog } from "../recordToLog";
import { getSnapshot } from "../getSnapshot";
import { bigIntMin, isDefined } from "@latticexyz/common/utils";

export type FetchInitialBlockLogsDozerArgs = {
  dozerUrl: string;
  storeAddress: Hex;
  filters?: DozerSyncFilter[];
  startBlock?: bigint;
  chainId: number;
};

export type FetchInitialBlockLogsDozerResult = {
  initialBlockLogs: StorageAdapterBlock;
};

export async function fetchInitialBlockLogsDozer({
  dozerUrl,
  storeAddress,
  filters,
  startBlock = 0n,
  chainId,
}: FetchInitialBlockLogsDozerArgs): Promise<FetchInitialBlockLogsDozerResult> {
  const initialBlockLogs: StorageAdapterBlock = { blockNumber: startBlock, logs: [] };

  // We execute the list of provided SQL queries for hydration. For performance
  // reasons the queries are not executed against a fixed block height, but against
  // the latest state. We therefore pass the min block number of all query results
  // as overall block number. This means some logs will be re-fetched again during
  // the hydration process, but after the hydration is complete, the state will be
  // correct. Intermediate state updates during hydration might be incorrect (for
  // partial updates), so we only notify consumers of state updates after the
  // initial hydration is complete.

  const sqlFilters = filters ? (filters.filter((filter) => "sql" in filter) as DozerTableQuery[]) : [];

  // Execute individual SQL queries as separate requests to parallelize on the backend.
  // Each individual request is expected to be executed against the same db state so it
  // can't be parallelized.
  const dozerTables = (
    await Promise.all(sqlFilters.map((filter) => fetchRecordsDozerSql({ dozerUrl, storeAddress, queries: [filter] })))
  ).filter(isDefined);

  if (dozerTables.length > 0) {
    // Use the minimum block number of all query results as the block number to start syncing from.
    initialBlockLogs.blockNumber = bigIntMin(...dozerTables.map((result) => result.blockHeight));
    initialBlockLogs.logs = dozerTables.flatMap(({ result: [{ table, records }] }) =>
      records.map((record) => recordToLog({ table, record, address: storeAddress })),
    );
  }

  // Fetch the tables without SQL filter from the snapshot logs API for better performance.
  const snapshotFilters =
    filters &&
    filters
      .filter((filter) => !("sql" in filter))
      .map((filter) => {
        const { table, key0, key1 } = filter as DozerLogFilter;
        return { tableId: table.tableId, key0, key1 } as SyncFilter;
      });

  const snapshot =
    // If no filters are provided, the entire state is fetched
    !snapshotFilters || snapshotFilters.length > 0
      ? await getSnapshot({
          chainId,
          address: storeAddress,
          filters: snapshotFilters,
          indexerUrl: dozerUrl,
        })
      : undefined;

  // The block number passed in the overall result will be the min of all queries and the snapshot.
  if (snapshot) {
    initialBlockLogs.blockNumber = bigIntMin(initialBlockLogs.blockNumber, snapshot.blockNumber);
    initialBlockLogs.logs = [...initialBlockLogs.logs, ...snapshot.logs];
  }

  return { initialBlockLogs };
}
