import { eq } from "drizzle-orm";
import { PgDatabase } from "drizzle-orm/pg-core";
import { buildTable, buildInternalTables, getTables } from "@latticexyz/store-sync/postgres";
import { QueryAdapter } from "@latticexyz/store-sync/trpc-indexer";
import { debug } from "../debug";
import { getAddress } from "viem";
import { isDefined } from "@latticexyz/common/utils";
import { decodeDynamicField } from "@latticexyz/protocol-parser";

/**
 * Creates a query adapter for the tRPC server/client to query data from Postgres.
 *
 * @param {PgDatabase<any>} database Postgres database object from Drizzle
 * @returns {Promise<QueryAdapter>} A set of methods used by tRPC endpoints.
 */
export async function createQueryAdapter(database: PgDatabase<any>): Promise<QueryAdapter> {
  const adapter: QueryAdapter = {
    async findAll({ chainId, address, filters = [] }) {
      // If _any_ filter has a table ID, this will filter down all data to just those tables. Which mean we can't yet mix table filters with key-only filters.
      // TODO: improve this so we can express this in the query (likely need to build and query the "megatable" rather than each distinct SQL table)
      const tableIds = Array.from(new Set(filters.map((filter) => filter.tableId).filter(isDefined)));
      const tables = (await getTables(database))
        .filter((table) => address == null || getAddress(address) === getAddress(table.address))
        .filter((table) => !tableIds.length || tableIds.includes(table.tableId));

      const tablesWithRecords = await Promise.all(
        tables.map(async (table) => {
          const sqliteTable = buildTable(table);
          const records = await database.select().from(sqliteTable).where(eq(sqliteTable.__isDeleted, false)).execute();
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
        })
      );

      const internalTables = buildInternalTables();
      const metadata = await database
        .select()
        .from(internalTables.chain)
        .where(eq(internalTables.chain.chainId, chainId))
        .execute();
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
