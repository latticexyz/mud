import { publicProcedure, router } from "../trpc";
import { z } from "zod";
import { Table, TableRecord } from "@latticexyz/store-sync";
import { createSqliteTable, chainState, getTables } from "@latticexyz/store-sync/sqlite";
import { eq } from "drizzle-orm";
import { getDatabase } from "./getDatabase";

export type TableWithRecords = Table & { records: TableRecord[] };

export const appRouter = router({
  findAll: publicProcedure
    .input(
      z.object({
        chainId: z.number(),
        address: z.string(), // TODO: refine to hex
      })
    )
    .query(async (opts): Promise<{ blockNumber: bigint | null; tables: TableWithRecords[] }> => {
      const { chainId, address } = opts.input;

      const db = await getDatabase();
      const tables = getTables(db).filter((table) => table.address === address);

      const tablesWithRows = tables.map((table) => {
        const { tableName, table: sqliteTable } = createSqliteTable(table);
        const records = db.select().from(sqliteTable).all();
        return {
          ...table,
          records: records.map((record) => ({
            key: Object.fromEntries(Object.entries(table.keySchema).map(([name]) => [name, record[name]])),
            value: Object.fromEntries(Object.entries(table.valueSchema).map(([name]) => [name, record[name]])),
          })),
        };
      });

      const metadata = db.select().from(chainState).where(eq(chainState.chainId, chainId)).all();
      const { lastUpdatedBlockNumber } = metadata[0] ?? {};

      const result = {
        blockNumber: lastUpdatedBlockNumber ?? null,
        tables: tablesWithRows,
      };

      // console.log("findAll:", opts, result);

      return result;
    }),
});

export type AppRouter = typeof appRouter;
