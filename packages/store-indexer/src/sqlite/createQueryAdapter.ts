import { eq } from "drizzle-orm";
import { BaseSQLiteDatabase } from "drizzle-orm/sqlite-core";
import { buildTable, chainState, getTables } from "@latticexyz/store-sync/sqlite";
import { QueryAdapter } from "@latticexyz/store-sync/trpc-indexer";
import { debug } from "../debug";
import { getAddress } from "viem";
import { isDefined } from "@latticexyz/common/utils";
import { decodeDynamicField } from "@latticexyz/protocol-parser";

/**
 * Creates a storage adapter for the tRPC server/client to query data from SQLite.
 *
 * @param {BaseSQLiteDatabase<"sync", any>} database SQLite database object from Drizzle
 * @returns {Promise<QueryAdapter>} A set of methods used by tRPC endpoints.
 */
export async function createQueryAdapter(database: BaseSQLiteDatabase<"sync", any>): Promise<QueryAdapter> {
  const adapter: QueryAdapter = {
    async findAll({ chainId, address, filters = [] }) {
      // If _any_ filter has a table ID, this will filter down all data to just those tables. Which mean we can't yet mix table filters with key-only filters.
      // TODO: improve this so we can express this in the query (likely need to build and query the "megatable" rather than each distinct SQL table)
      const tableIds = Array.from(new Set(filters.map((filter) => filter.tableId).filter(isDefined)));
      const tables = getTables(database)
        .filter((table) => address == null || getAddress(address) === getAddress(table.address))
        .filter((table) => !tableIds.length || tableIds.includes(table.tableId));

      const tablesWithRecords = tables.map((table) => {
        const sqliteTable = buildTable(table);
        const records = database.select().from(sqliteTable).where(eq(sqliteTable.__isDeleted, false)).all();
        const filteredRecords = !filters.length
          ? records
          : records.filter((record) => {
              const keyTuple = decodeDynamicField("bytes32[]", record.__key);
              return filters.some(
                (filter) =>
                  (filter.tableId == null || filter.tableId === table.tableId) &&
                  (filter.key0 == null || filter.key0 === keyTuple[0]) &&
                  (filter.key1 == null || filter.key1 === keyTuple[1])
              );
            });
        return {
          ...table,
          records: filteredRecords.map((record) => ({
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
