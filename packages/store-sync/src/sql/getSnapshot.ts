import { LogFilter, SyncFilter, TableQuery } from "./common";
import { Hex } from "viem";
import { StorageAdapterBlock, SyncFilter as LegacyLogFilter } from "../common";
import { fetchRecords } from "./fetchRecords";
import { recordToLog } from "../recordToLog";
import { getSnapshot as getSnapshotLogs } from "../getSnapshot";
import { bigIntMin, isDefined } from "@latticexyz/common/utils";

export type GetSnapshotArgs = {
  indexerUrl: string;
  storeAddress: Hex;
  filters?: SyncFilter[];
  startBlock?: bigint;
  chainId: number;
};

export type GetSnapshotResult = {
  initialBlockLogs: StorageAdapterBlock;
};

export async function getSnapshot({
  indexerUrl,
  storeAddress,
  filters,
  startBlock = 0n,
  chainId,
}: GetSnapshotArgs): Promise<GetSnapshotResult> {
  try {
    // We execute the list of provided SQL queries for hydration. For performance
    // reasons the queries are not executed against a fixed block height, but against
    // the latest state. We therefore pass the min block number of all query results
    // as overall block number. This means some logs will be re-fetched again during
    // the hydration process, but after the hydration is complete, the state will be
    // correct. Intermediate state updates during hydration might be incorrect (for
    // partial updates), so we only notify consumers of state updates after the
    // initial hydration is complete.

    const sqlFilters = filters ? (filters.filter((filter) => "sql" in filter) as TableQuery[]) : [];

    const fetchLogs = async (): Promise<StorageAdapterBlock | undefined> => {
      // Fetch the tables without SQL filter from the snapshot logs API for better performance.
      const logsFilters =
        filters &&
        filters
          .filter((filter) => !("sql" in filter))
          .map((filter) => {
            const { table, key0, key1 } = filter as LogFilter;
            return { tableId: table.tableId, key0, key1 } as LegacyLogFilter;
          });

      if (logsFilters && logsFilters.length === 0) {
        return;
      }

      return getSnapshotLogs({
        chainId,
        address: storeAddress,
        filters: logsFilters,
        indexerUrl,
      });
    };

    const fetchSql = async (query: TableQuery): Promise<StorageAdapterBlock | undefined> => {
      const result = await fetchRecords({ indexerUrl, storeAddress, queries: [query] });
      return {
        blockNumber: result.blockHeight,
        logs: result.result.flatMap(({ table, records }) =>
          records.map((record) => recordToLog({ table, record, address: storeAddress })),
        ),
      };
    };

    // Execute individual SQL queries as separate requests to parallelize on the backend.
    // Each individual request is expected to be executed against the same db state so it
    // can't be parallelized.
    const results = (await Promise.all([fetchLogs(), ...sqlFilters.map(fetchSql)])).filter(isDefined);
    // The block number passed in the overall result will be the min of all queries and the logs.
    const initialBlockLogs = {
      blockNumber: results.length > 0 ? bigIntMin(...results.map((result) => result.blockNumber)) : startBlock,
      logs: results.flatMap((result) => result.logs),
    };

    return { initialBlockLogs };
  } catch (e) {
    console.warn(`Failed to load snapshot. ${e}`);
    return { initialBlockLogs: { blockNumber: startBlock - 1n, logs: [] } };
  }
}
