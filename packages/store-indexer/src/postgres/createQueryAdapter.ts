import { eq } from "drizzle-orm";
import { PgDatabase } from "drizzle-orm/pg-core";
import { buildTable, buildInternalTables, getTables } from "@latticexyz/store-sync/postgres";
import { QueryAdapter } from "@latticexyz/store-sync/trpc-indexer";
import { debug } from "../debug";
import { getAddress } from "viem";

/**
 * Creates a query adapter for the tRPC server/client to query data from Postgres.
 *
 * @param {PgDatabase<any>} database Postgres database object from Drizzle
 * @returns {Promise<QueryAdapter>} A set of methods used by tRPC endpoints.
 */
export async function createQueryAdapter(database: PgDatabase<any>): Promise<QueryAdapter> {
  const adapter: QueryAdapter = {
    async findAll(chainId, address) {
      const internalTables = buildInternalTables();
      const tables = (await getTables(database)).filter(
        (table) => address != null && getAddress(address) === getAddress(table.address)
      );

      const tablesWithRecords = await Promise.all(
        tables.map(async (table) => {
          const sqliteTable = buildTable(table);
          const records = await database.select().from(sqliteTable).where(eq(sqliteTable.__isDeleted, false)).execute();
          return {
            ...table,
            records: records.map((record) => ({
              key: Object.fromEntries(Object.entries(table.keySchema).map(([name]) => [name, record[name]])),
              value: Object.fromEntries(Object.entries(table.valueSchema).map(([name]) => [name, record[name]])),
            })),
          };
        })
      );

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
