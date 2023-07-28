import { z } from "zod";
import { publicProcedure, router } from "./trpc";
import { StorageAdapter } from "./common";
import { Hex } from "viem";

export const appRouter = router({
  findAll: publicProcedure
    .input(
      z.object({
        chainId: z.number(),
        address: z.string(), // TODO: refine to hex
      })
    )
    .query(async (opts): ReturnType<StorageAdapter["findAll"]> => {
      const { storageAdapter } = opts.ctx;
      const { chainId, address } = opts.input;
      return storageAdapter.findAll(chainId, address as Hex);
    }),
});

export type AppRouter = typeof appRouter;
