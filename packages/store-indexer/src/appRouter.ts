import { DynamicAbiType, DynamicPrimitiveType, StaticAbiType, StaticPrimitiveType } from "@latticexyz/schema-type";
import { publicProcedure, router } from "./trpc";
import { z } from "zod";

type TableRow = {
  keyTuple: Record<string, StaticPrimitiveType>;
  value: Record<string, StaticPrimitiveType | DynamicPrimitiveType>;
};

type TableResult = {
  namespace: string;
  name: string;
  schema: {
    keyTuple: Record<string, StaticAbiType>;
    value: Record<string, StaticAbiType | DynamicAbiType>;
  };
  rows: TableRow[];
  lastBlockNumber: bigint;
};

const appRouter = router({
  findAll: publicProcedure
    .input(
      z.object({
        chainId: z.number(),
        address: z.string(), // TODO: refine to hex
      })
    )
    .query(async (opts): Promise<TableResult[]> => {
      const { chainId, address } = opts.input;

      // TODO: fetch these from DB and return

      return [];
    }),
});

export type AppRouter = typeof appRouter;
