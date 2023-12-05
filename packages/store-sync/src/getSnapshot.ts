import { StorageAdapterBlock, SyncOptions, TableWithRecords } from "./common";
import { debug as parentDebug } from "./debug";
import { createIndexerClient } from "./trpc-indexer";
import { TRPCClientError } from "@trpc/client";
import { tablesWithRecordsToLogs } from "./tablesWithRecordsToLogs";
import { isTableRegistrationLog } from "./isTableRegistrationLog";
import { getAddress } from "viem";
import { logToTable } from "./logToTable";
import { groupBy } from "@latticexyz/common/utils";
import { decodeKey, decodeValueArgs, encodeKey, encodeValueArgs } from "@latticexyz/protocol-parser";
import { tableToLog } from "./tableToLog";

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

    const opts = { chainId, address, filters: filters ?? [] };

    const { blockNumber, logs } = await indexer.getLogs.query(opts);
    // console.log("number of logs before encoding", logs.length);

    const tables = logs.filter(isTableRegistrationLog).map(logToTable);

    // const tablesInLogs = new Set(logs.map((log) => log.args.tableId));
    // const tablesWithoutRegistration = [...tablesInLogs].filter(
    //   (tableIdInLogs) => !tables.find((table) => table.tableId === tableIdInLogs)
    // );
    // console.log("num tables with registration log", tables.length);
    // console.log("num tables in logs", tablesInLogs.size);
    // console.log("tables without registration log", tablesWithoutRegistration);

    // const filteredLogs = logs.filter((log) => log.args.tableId !== tablesWithoutRegistration[0]);
    // console.log("number of logs from tables with registration log", filteredLogs.length);

    const logsByTable = groupBy(logs, (log) => `${getAddress(log.address)}:${log.args.tableId}`);

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

    const logsAfter = tablesWithRecordsToLogs(tablesWithRecords);
    // const logsByTableFlat = [...logsByTable.values()].flat().reverse();

    // const decodedEncodedLogs = logsByTableFlat.map((log) => {
    //   const table = tables.find((table) => table.tableId === log.args.tableId)!;

    //   if (!table) {
    //     console.warn("no tableid found for log with tableid", log.args.tableId);
    //     return log;
    //   }

    //   const value = decodeValueArgs(table.valueSchema, log.args as any);
    //   const key = decodeKey(table.keySchema, log.args.keyTuple);

    //   return {
    //     ...log,
    //     args: {
    //       tableId: table.tableId,
    //       keyTuple: encodeKey(table.keySchema, key),
    //       ...encodeValueArgs(table.valueSchema, value),
    //     },
    //   };
    // }) as any;

    // console.log(logsAfter);
    // console.log(filteredLogs);
    // console.log(logsByTableFlat);

    // const logsWithRegistrationLogsFirst = [...tables.map(tableToLog), ...logs];

    return {
      blockNumber,
      logs, // logsWithRegistrationLogsFirst,
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
