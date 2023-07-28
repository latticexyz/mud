import { z } from "zod";
import { publicProcedure, router } from "./trpc";
import { StorageAdapter } from "./common";
import { isHex } from "viem";

export const appRouter = router({
  findAll: publicProcedure
    .input(
      z.object({
        chainId: z.number(),
        address: z.string().refine(isHex),
      })
    )
    .query(async (opts): ReturnType<StorageAdapter["findAll"]> => {
      const { storageAdapter } = opts.ctx;
      const { chainId, address } = opts.input;
      return storageAdapter.findAll(chainId, address);
    }),
});

export type AppRouter = typeof appRouter;
