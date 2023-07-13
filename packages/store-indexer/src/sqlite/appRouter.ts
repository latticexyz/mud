import { publicProcedure, router } from "../trpc";
import { z } from "zod";
import { Hex } from "viem";
import { chainState, getDatabase, getInternalDatabase, getTables } from "./sqlite";
import { TableWithRows } from "../common";
import { createSqliteTable } from "./createSqliteTable";
import { eq } from "drizzle-orm";

export const appRouter = router({
  findAll: publicProcedure
    .input(
      z.object({
        chainId: z.number(),
        address: z.string(), // TODO: refine to hex
      })
    )
    .query(async (opts): Promise<{ blockNumber: bigint | null; tables: TableWithRows[] }> => {
      const { chainId, address } = opts.input;

      const db = await getDatabase(chainId, address as Hex);
      const tables = await getTables(db);

      const tablesWithRows = await Promise.all(
        tables.map(async (table) => {
          const { tableName, table: sqliteTable } = createSqliteTable(table);
          const rows = db.select().from(sqliteTable).all();
          // console.log("got rows for table", tableName, rows);
          return {
            ...table,
            rows: rows.map((row) => ({
              keyTuple: Object.fromEntries(Object.entries(table.keyTupleSchema).map(([name]) => [name, row[name]])),
              value: Object.fromEntries(Object.entries(table.valueSchema).map(([name]) => [name, row[name]])),
            })),
          };
        })
      );

      const internalDb = await getInternalDatabase();
      const metadata = internalDb.select().from(chainState).where(eq(chainState.chainId, chainId)).all();
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
