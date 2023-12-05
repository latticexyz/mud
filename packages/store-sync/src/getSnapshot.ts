import { StorageAdapterBlock, SyncOptions, TableWithRecords } from "./common";
import { debug as parentDebug } from "./debug";
import { createIndexerClient } from "./trpc-indexer";
import { TRPCClientError } from "@trpc/client";
import { tablesWithRecordsToLogs } from "./tablesWithRecordsToLogs";
import { isTableRegistrationLog } from "./isTableRegistrationLog";
import { getAddress } from "viem";
import { logToTable } from "./logToTable";
import { groupBy } from "@latticexyz/common/utils";
import { decodeKey, decodeValueArgs } from "@latticexyz/protocol-parser";

const debug = parentDebug.extend("getSnapshot");

type GetSnapshotOptions = Pick<
  SyncOptions,
  "address" | "filters" | "indexerUrl" | "initialBlockLogs" | "initialState"
> & {
  chainId: number;
};

export async function getSnapshot({
  chainId,
  address,
  filters,
  initialState,
  initialBlockLogs,
  indexerUrl,
}: GetSnapshotOptions): Promise<StorageAdapterBlock | undefined> {
  // TODO: extend types to enforce this
  if (initialBlockLogs && initialState) {
    throw new Error("Only one of initialBlockLogs or initialState should be provided.");
  }

  if (initialBlockLogs) return initialBlockLogs;

  // Backwards compatibility with older indexers
  // TODO: remove in the future
  if (initialState) {
    return {
      blockNumber: initialState.blockNumber,
      logs: tablesWithRecordsToLogs(initialState.tables),
    };
  }

  if (!indexerUrl) return;

  const indexer = createIndexerClient({ url: indexerUrl });

  try {
    debug("fetching logs from indexer", indexerUrl);

    // const benchmark = createBenchmark();

    const opts = { chainId, address, filters: filters ?? [] };

    const { blockNumber, logs } = await indexer.getLogs.query(opts);

    // benchmark("getLogs");

    const tables = logs.filter(isTableRegistrationLog).map(logToTable);

    // benchmark("filter");

    const logsByTable = groupBy(logs, (log) => `${getAddress(log.address)}:${log.args.tableId}`);

    // benchmark("groupBy");

    const tablesWithRecords: TableWithRecords[] = tables.map((table) => {
      const tableLogs = logsByTable.get(`${getAddress(table.address)}:${table.tableId}`) ?? [];
      const records = tableLogs.map((log) => ({
        key: decodeKey(table.keySchema, log.args.keyTuple),
        value: decodeValueArgs(table.valueSchema, log.args as any),
      }));

      return {
        ...table,
        records,
      };
    });

    // benchmark("tablesWithRecords");

    debug("findAll: decoded %d logs across %d tables", logs.length, tables.length);

    return {
      blockNumber,
      logs: tablesWithRecordsToLogs(tablesWithRecords),
    };

    // return await indexer.getLogs.query({ chainId, address, filters });
  } catch (error) {
    if (error instanceof TRPCClientError) {
      // Backwards compatibility with older indexers
      // TODO: remove in the future
      debug("failed to fetch logs, fetching table records instead", indexerUrl);
      const result = await indexer.findAll.query({ chainId, address, filters });
      // warn after we fetch from old endpoint so we know that the indexer is accessible
      console.warn(
        `The indexer at ${indexerUrl} appears to be outdated. Consider upgrading to a recent version for better performance.`
      );

      // if the indexer returns no block number, it hasn't indexed this chain
      if (result.blockNumber == null) {
        return;
      }
      return {
        blockNumber: result.blockNumber,
        logs: tablesWithRecordsToLogs(result.tables),
      };
    }
    throw error;
  }
}
