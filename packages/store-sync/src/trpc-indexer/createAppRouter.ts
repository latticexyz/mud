import { z } from "zod";
import { StorageAdapter } from "./common";
import { isHex } from "viem";
import { initTRPC } from "@trpc/server";
import superjson from "superjson";

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function createAppRouter() {
  const t = initTRPC.context<{ storageAdapter: StorageAdapter }>().create({
    transformer: superjson,
  });

  return t.router({
    findAll: t.procedure
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
}

export type AppRouter = ReturnType<typeof createAppRouter>;
