import { publicProcedure, router } from "./trpc";
import { z } from "zod";
import { Table, database, getWorldId } from "./fakeDatabase";
import { Hex } from "viem";

export const appRouter = router({
  findAll: publicProcedure
    .input(
      z.object({
        chainId: z.number(),
        address: z.string(), // TODO: refine to hex
      })
    )
    .query(async (opts): Promise<{ blockNumber: bigint; tables: Table[] }> => {
      const { chainId, address } = opts.input;

      // TODO: fetch these from DB and return
      console.log(database);

      const result = {
        blockNumber: database.lastBlockNumber,
        tables: Array.from(database.tables.get(getWorldId(chainId, address as Hex))?.values() ?? []),
      };
      console.log("findAll:", opts, result);

      return result;
    }),
});

export type AppRouter = typeof appRouter;
