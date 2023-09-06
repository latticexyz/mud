import { eq } from "drizzle-orm";
import { BaseSQLiteDatabase } from "drizzle-orm/sqlite-core";
import { createSqliteTable, chainState, getTables } from "@latticexyz/store-sync/sqlite";
import { QueryAdapter } from "@latticexyz/store-sync/trpc-indexer";
import { debug } from "../debug";

/**
 * Creates a storage adapter for the tRPC server/client to query data from SQLite.
 *
 * @param {BaseSQLiteDatabase<"sync", any>} database SQLite database object from Drizzle
 * @returns {Promise<QueryAdapter>} A set of methods used by tRPC endpoints.
 */
export async function createQueryAdapter(database: BaseSQLiteDatabase<"sync", any>): Promise<QueryAdapter> {
  const adapter: QueryAdapter = {
    async findAll(chainId, address) {
      const tables = getTables(database).filter((table) => table.address === address);

      const tablesWithRecords = tables.map((table) => {
        const sqliteTable = createSqliteTable(table);
        const records = database.select().from(sqliteTable).where(eq(sqliteTable.__isDeleted, false)).all();
        return {
          ...table,
          records: records.map((record) => ({
            key: Object.fromEntries(Object.entries(table.keySchema).map(([name]) => [name, record[name]])),
            value: Object.fromEntries(Object.entries(table.valueSchema).map(([name]) => [name, record[name]])),
          })),
        };
      });

      const metadata = database.select().from(chainState).where(eq(chainState.chainId, chainId)).all();
      const { lastUpdatedBlockNumber } = metadata[0] ?? {};

      const result = {
        blockNumber: lastUpdatedBlockNumber ?? null,
        tables: tablesWithRecords,
      };

      debug("findAll", chainId, address, result);

      return result;
    },
  };
  return adapter;
}
