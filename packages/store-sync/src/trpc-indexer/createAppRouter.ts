import { z } from "zod";
import { QueryAdapter } from "./common";
import { isHex } from "viem";
import { initTRPC } from "@trpc/server";
import superjson from "superjson";

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function createAppRouter() {
  const t = initTRPC.context<{ queryAdapter: QueryAdapter }>().create({
    transformer: superjson,
  });

  return t.router({
    findAll: t.procedure
      .input(
        z.object({
          chainId: z.number(),
          address: z.string().refine(isHex).optional(),
        })
      )
      .query(async (opts): ReturnType<QueryAdapter["findAll"]> => {
        const { queryAdapter } = opts.ctx;
        const { chainId, address } = opts.input;
        return queryAdapter.findAll(chainId, address);
      }),
  });
}

export type AppRouter = ReturnType<typeof createAppRouter>;
