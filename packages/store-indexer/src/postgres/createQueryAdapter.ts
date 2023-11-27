import { PgDatabase } from "drizzle-orm/pg-core";
import { QueryAdapter } from "@latticexyz/store-sync/trpc-indexer";
import { debug } from "../debug";
import { getAddress } from "viem";
import { decodeKey, decodeValueArgs } from "@latticexyz/protocol-parser";
import { getLogs } from "./getLogs";
import { TableWithRecords, isTableRegistrationLog, logToTable } from "@latticexyz/store-sync";

/**
 * Creates a query adapter for the tRPC server/client to query data from Postgres.
 *
 * @param {PgDatabase<any>} database Postgres database object from Drizzle
 * @returns {Promise<QueryAdapter>} A set of methods used by tRPC endpoints.
 */
export async function createQueryAdapter(database: PgDatabase<any>): Promise<QueryAdapter> {
  const adapter: QueryAdapter = {
    async getLogs(opts) {
      return getLogs(database, opts);
    },
    async findAll(opts) {
      const { blockNumber, logs } = await getLogs(database, opts);

      const tables = logs.filter(isTableRegistrationLog).map(logToTable);

      const tablesWithRecords: TableWithRecords[] = tables.map((table) => {
        const records = logs
          .filter((log) => getAddress(log.address) === getAddress(table.address) && log.args.tableId === table.tableId)
          .map((log) => ({
            key: decodeKey(table.keySchema, log.args.keyTuple),
            value: decodeValueArgs(table.valueSchema, log.args),
          }));

        return {
          ...table,
          records,
        };
      });

      debug("findAll: decoded %d logs across %d tables", logs.length, tables.length);

      return {
        blockNumber,
        tables: tablesWithRecords,
      };
    },
  };
  return adapter;
}
