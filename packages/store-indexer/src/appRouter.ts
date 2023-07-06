import { publicProcedure, router } from "./trpc";
import { z } from "zod";
import { Table } from "./fakeDatabase";

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

      return { blockNumber: -1n, tables: [] };
    }),
});

export type AppRouter = typeof appRouter;
