import { BaseSQLiteDatabase } from "drizzle-orm/sqlite-core";
import { QueryAdapter } from "@latticexyz/store-sync/trpc-indexer";
import { getTablesWithRecords } from "./getTablesWithRecords";
import { tablesWithRecordsToLogs } from "@latticexyz/store-sync";

/**
 * Creates a storage adapter for the tRPC server/client to query data from SQLite.
 *
 * @param {BaseSQLiteDatabase<"sync", any>} database SQLite database object from Drizzle
 * @returns {Promise<QueryAdapter>} A set of methods used by tRPC endpoints.
 */
export async function createQueryAdapter(database: BaseSQLiteDatabase<"sync", any>): Promise<QueryAdapter> {
  const adapter: QueryAdapter = {
    async getLogs(opts) {
      const { blockNumber, tables } = getTablesWithRecords(database, opts);
      const logs = tablesWithRecordsToLogs(tables);
      return { blockNumber: blockNumber ?? 0n, logs };
    },
    async findAll(opts) {
      return getTablesWithRecords(database, opts);
    },
  };
  return adapter;
}
