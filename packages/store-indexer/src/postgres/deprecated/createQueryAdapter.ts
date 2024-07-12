import { getAddress } from "viem";
import { PgDatabase } from "drizzle-orm/pg-core";
import { TableWithRecords, isTableRegistrationLog, logToTable, schemasTable } from "@latticexyz/store-sync";
import { KeySchema, decodeKey, decodeValueArgs } from "@latticexyz/protocol-parser/internal";
import { QueryAdapter } from "@latticexyz/store-sync/trpc-indexer";
import { debug } from "../../debug";
import { getLogs } from "./getLogs";
import { groupBy } from "@latticexyz/common/utils";

/**
 * Creates a query adapter for the tRPC server/client to query data from Postgres.
 *
 * @param {PgDatabase<any>} database Postgres database object from Drizzle
 * @returns {Promise<QueryAdapter>} A set of methods used by tRPC endpoints.
 * @deprecated
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function createQueryAdapter(database: PgDatabase<any>): Promise<QueryAdapter> {
  const adapter: QueryAdapter = {
    async getLogs(opts) {
      return getLogs(database, opts);
    },
    async findAll(opts) {
      const filters = opts.filters ?? [];
      const { blockNumber, logs } = await getLogs(database, {
        ...opts,
        // make sure we're always retrieving `store.Tables` table, so we can decode table values
        filters: filters.length > 0 ? [...filters, { tableId: schemasTable.tableId }] : [],
      });

      const tables = logs.filter(isTableRegistrationLog).map(logToTable);

      const logsByTable = groupBy(logs, (log) => `${getAddress(log.address)}:${log.args.tableId}`);

      const tablesWithRecords: readonly TableWithRecords[] = tables.map((table) => {
        const tableLogs = logsByTable.get(`${getAddress(table.address)}:${table.tableId}`) ?? [];
        const records = tableLogs.map((log) => {
          const key = decodeKey(table.keySchema as KeySchema, log.args.keyTuple);
          const value = decodeValueArgs(table.valueSchema, log.args);
          return { key, value, fields: { ...key, ...value } };
        });

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
